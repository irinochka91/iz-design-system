import { forwardRef, useId, type ReactNode } from 'react';
import {
  CheckboxField as AriaCheckboxField,
  type CheckboxFieldProps as AriaCheckboxFieldProps,
  CheckboxButton,
  Label,
  Text,
} from 'react-aria-components';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'md' | 'lg';

type BaseProps = Omit<AriaCheckboxFieldProps, 'children' | 'className' | 'style'> & {
  /** Help text under the label, linked by aria-describedby. */
  description?: string;
  /** Shown when isInvalid. Its element is always in the DOM so the announcement is immediate. */
  errorMessage?: string;
  /** Row min-height 24 / 44 px (size.target.min / size.target.touch). The box is 1em and scales with zoom. */
  size?: CheckboxSize;
  className?: string;
};

/**
 * The visible label is the default and the accessible name. A bare box (table row) may drop it
 * only by passing aria-label; TypeScript refuses a checkbox with neither.
 */
export type CheckboxProps =
  | (BaseProps & { children: ReactNode; 'aria-label'?: string })
  | (BaseProps & { children?: undefined; 'aria-label': string });

const Check = () => (
  <svg className={styles.glyph} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path className={styles.check} d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    <path className={styles.dash} d="M4 8h8" />
  </svg>
);

/**
 * Checkbox — a binary or indeterminate choice with a visible label. Not for one-way actions with Undo
 * (the ActionRow done ring is a Button), not for immediate settings (Switch).
 * Behaviour (toggle, aria-checked incl. "mixed", label association, aria-describedby, aria-invalid,
 * aria-required, read-only) comes from React Aria; this file only maps props to structure and styles.
 * Spec: ./Checkbox.spec.json · Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, description, errorMessage, size = 'md', className, isInvalid, isRequired, ...rest },
  ref,
) {
  const classes = [styles.root, styles[size], className].filter(Boolean).join(' ');
  // React Aria Components 1.22 does not associate a <Label> inside CheckboxField with its input
  // (no id, no aria-labelledby — found by the unit test). Wire it by hand: the input gets an id,
  // the label names it (aria-labelledby) and targets it (htmlFor), so the text is clickable too.
  const inputId = useId();
  const labelId = useId();

  return (
    <AriaCheckboxField
      className={classes}
      inputRef={ref}
      id={inputId}
      {...(children ? { 'aria-labelledby': labelId } : {})}
      // aria, not native (ADR-022): isInvalid stays controlled, isRequired emits aria-required, no browser bubble.
      validationBehavior="aria"
      {...(isInvalid !== undefined ? { isInvalid } : {})}
      {...(isRequired !== undefined ? { isRequired } : {})}
      {...rest}
    >
      {/* The box: a <label> around the hidden native input, so clicking it toggles. Focus ring lives here. */}
      <CheckboxButton className={styles.box ?? ''}>
        <Check />
      </CheckboxButton>
      {children && (
        <Label id={labelId} htmlFor={inputId} className={styles.label}>
          {children}
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
      {/* Always rendered — empty while valid — so aria-describedby is stable and the error is announced
          the moment isInvalid flips (same contract as TextField). */}
      <Text slot="errorMessage" className={styles.error}>
        {isInvalid ? errorMessage : ''}
      </Text>
    </AriaCheckboxField>
  );
});
