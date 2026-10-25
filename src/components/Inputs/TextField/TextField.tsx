import { forwardRef, type ReactNode } from 'react';
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  Label,
  Input,
  Text,
} from 'react-aria-components';
import styles from './TextField.module.css';

export type TextFieldSize = 'md' | 'lg';
export type TextFieldType = 'text' | 'email' | 'url' | 'tel' | 'search' | 'password';

type BaseProps = Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'type'> & {
  /** Help text under the field, linked by aria-describedby. Format hints go here, never in placeholder. */
  description?: string;
  /** Shown when isInvalid. Its element is always in the DOM so the announcement is immediate. */
  errorMessage?: string;
  /** Native input type: drives the mobile keyboard, autofill and password managers. */
  type?: TextFieldType;
  /** Example value only, in muted text. Never the label, never the instructions. */
  placeholder?: string;
  /** Field heights 40 / 44 px (size.target.lg / size.target.touch). lg is the touch default. */
  size?: TextFieldSize;
  /** Stretches to the container's inline size. */
  isFullWidth?: boolean;
  /** Decorative leading icon inside the field (aria-hidden applied). */
  iconStart?: ReactNode;
  /** Trailing <kbd> showing the shortcut that focuses this field. aria-hidden. */
  kbdHint?: string;
  className?: string;
};

/**
 * A visible label is the default. A field may drop it only by passing aria-label instead
 * (the quick-add row); TypeScript refuses a field with neither.
 */
export type TextFieldProps =
  | (BaseProps & { label: string; 'aria-label'?: string })
  | (BaseProps & { label?: undefined; 'aria-label': string });

/**
 * TextField — single-line text entry with label, description and an announced error.
 * Behaviour (labelling, aria-describedby, aria-invalid, aria-required, read-only) comes from React Aria;
 * this file only maps props to structure and styles.
 * Spec: ./TextField.spec.json · Pattern: https://www.w3.org/WAI/tutorials/forms/
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    description,
    errorMessage,
    type = 'text',
    placeholder,
    size = 'md',
    isFullWidth = false,
    iconStart,
    kbdHint,
    className,
    isInvalid,
    isRequired,
    ...rest
  },
  ref,
) {
  const classes = [styles.root, styles[size], isFullWidth && styles.fullWidth, className].filter(Boolean).join(' ');

  return (
    <AriaTextField
      className={classes}
      // aria, not native: isInvalid stays fully controlled and the browser's own validation bubble never
      // competes with errorMessage. Also makes isRequired emit aria-required instead of the required attribute.
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
      <div className={styles.field}>
        {iconStart && (
          <span className={styles.icon} aria-hidden="true">
            {iconStart}
          </span>
        )}
        {/* styles.input is string | undefined under noUncheckedIndexedAccess; RAC Input refuses undefined. */}
        <Input ref={ref} className={styles.input ?? ''} type={type} {...(placeholder !== undefined ? { placeholder } : {})} />
        {kbdHint && (
          <kbd className={styles.kbd} aria-hidden="true">
            {kbdHint}
          </kbd>
        )}
      </div>
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      {/* Always rendered: the element (and its id in aria-describedby) exists before the error does,
          so flipping isInvalid announces the text at once. Empty when valid, so nothing is read. */}
      <Text slot="errorMessage" className={styles.error}>
        {isInvalid ? errorMessage : ''}
      </Text>
    </AriaTextField>
  );
});
