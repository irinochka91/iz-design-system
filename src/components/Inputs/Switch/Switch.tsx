import { forwardRef, useId, type ReactNode } from 'react';
import {
  SwitchField as AriaSwitchField,
  type SwitchFieldProps as AriaSwitchFieldProps,
  SwitchButton,
  Label,
  Text,
} from 'react-aria-components';
import styles from './Switch.module.css';

export type SwitchSize = 'md' | 'lg';
export type SwitchLabelPlacement = 'end' | 'start';

// A setting cannot be required or invalid (ADR-031): the validation props never reach the type.
type BaseProps = Omit<
  AriaSwitchFieldProps,
  'children' | 'className' | 'style' | 'isRequired' | 'isInvalid' | 'validate' | 'validationBehavior'
> & {
  /** Help text under the label, linked by aria-describedby — what the setting does. */
  description?: string;
  /** Where the text sits relative to the track; 'start' is the settings-list layout. DOM order and name do not change. */
  labelPlacement?: SwitchLabelPlacement;
  /** Row min-height 24 / 44 px (size.target.min / size.target.touch). The track is em-sized and scales with zoom. */
  size?: SwitchSize;
  className?: string;
};

/**
 * The visible label is the default and the accessible name. A bare switch (a row that already shows the
 * text) may drop it only by passing aria-label; TypeScript refuses a switch with neither.
 */
export type SwitchProps =
  | (BaseProps & { children: ReactNode; 'aria-label'?: string })
  | (BaseProps & { children?: undefined; 'aria-label': string });

/**
 * Switch — an on/off setting that applies the moment it changes. Not a form choice (Checkbox), not an
 * action (Button), never consent. Behaviour (toggle, role="switch", aria-checked, label association,
 * aria-describedby, read-only) comes from React Aria; this file only maps props to structure and styles.
 * Spec: ./Switch.spec.json · Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { children, description, labelPlacement = 'end', size = 'md', className, ...rest },
  ref,
) {
  const classes = [styles.root, styles[size], labelPlacement === 'start' ? styles.labelStart : '', className]
    .filter(Boolean)
    .join(' ');
  // Same wiring as Checkbox (ADR-023): React Aria Components 1.22 does not associate a <Label> inside
  // the field with its input, so the input gets an id and the label names and targets it.
  const inputId = useId();
  const labelId = useId();

  return (
    <AriaSwitchField
      className={classes}
      inputRef={ref}
      id={inputId}
      {...(children ? { 'aria-labelledby': labelId } : {})}
      {...rest}
    >
      {/* The track: a <label> around the hidden native input, so clicking it toggles. Focus ring lives here. */}
      <SwitchButton className={styles.button ?? ''}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </SwitchButton>
      {children && (
        <Label id={labelId} htmlFor={inputId} className={styles.label}>
          {children}
        </Label>
      )}
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
    </AriaSwitchField>
  );
});
