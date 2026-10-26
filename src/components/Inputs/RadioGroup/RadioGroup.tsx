import { forwardRef, type ReactElement, type ReactNode } from 'react';
import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  Radio as AriaRadio,
  type RadioProps as AriaRadioProps,
  Label,
  Text,
} from 'react-aria-components';
import styles from './RadioGroup.module.css';

export type RadioGroupSize = 'md' | 'lg';
export type RadioGroupOrientation = 'vertical' | 'horizontal';

export type RadioProps = Omit<AriaRadioProps, 'children' | 'className' | 'style'> & {
  /** The option's visible label AND accessible name, in a real <label>. There is no bare radio. */
  children: ReactNode;
  className?: string;
};

type BaseGroupProps = Omit<AriaRadioGroupProps, 'children' | 'className' | 'style' | 'orientation'> & {
  /** The options, in reading order. Two to about six. */
  children: ReactElement<RadioProps> | ReactElement<RadioProps>[];
  /** Help text under the group name, linked by aria-describedby. */
  description?: string;
  /** Shown when isInvalid. Its element is always in the DOM so the announcement is immediate. */
  errorMessage?: string;
  /** Layout only — both arrow axes work in both. Horizontal wraps rather than overflows. */
  orientation?: RadioGroupOrientation;
  /** Row min-height 24 / 44 px per radio (size.target.min / size.target.touch). */
  size?: RadioGroupSize;
  className?: string;
};

/** The group's visible name is the default; aria-label is the only way to drop it. */
export type RadioGroupProps =
  | (BaseGroupProps & { label: ReactNode; 'aria-label'?: string })
  | (BaseGroupProps & { label?: undefined; 'aria-label': string });

/**
 * Radio — one option of a RadioGroup. The circle is a <label> around the hidden native input; the dot is
 * drawn when selected (never colour-only). Spec: ./RadioGroup.spec.json
 */
export const Radio = forwardRef<HTMLLabelElement, RadioProps>(function Radio({ children, className, ...rest }, ref) {
  return (
    <AriaRadio ref={ref} className={[styles.radio, className].filter(Boolean).join(' ')} {...rest}>
      <span className={styles.circle} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      <span className={styles.radioLabel}>{children}</span>
    </AriaRadio>
  );
});

/**
 * RadioGroup — one choice from a short, fully visible list. Behaviour (roving tabindex, arrows move and
 * select, Space selects, group name via aria-labelledby, aria-describedby, aria-invalid, aria-required,
 * read-only) comes from React Aria; this file only maps props to structure and styles.
 * Spec: ./RadioGroup.spec.json · Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { label, children, description, errorMessage, orientation = 'vertical', size = 'md', className, isInvalid, isRequired, ...rest },
  ref,
) {
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ');
  return (
    <AriaRadioGroup
      ref={ref}
      className={classes}
      orientation={orientation}
      // aria, not native (ADR-022): isInvalid stays controlled, isRequired emits aria-required, no browser bubble.
      validationBehavior="aria"
      {...(isInvalid !== undefined ? { isInvalid } : {})}
      {...(isRequired !== undefined ? { isRequired } : {})}
      {...rest}
    >
      {label && (
        <Label className={styles.label}>
          {label}
          {isRequired && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      <div className={styles.options}>{children}</div>
      {/* Always rendered — empty while valid — so aria-describedby is stable and the error is announced
          the moment isInvalid flips (same contract as TextField and Checkbox). */}
      <Text slot="errorMessage" className={styles.error}>
        {isInvalid ? errorMessage : ''}
      </Text>
    </AriaRadioGroup>
  );
});
