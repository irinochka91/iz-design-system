import { forwardRef, type ReactNode } from 'react';
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type BaseProps = Omit<AriaButtonProps, 'children' | 'className' | 'style'> & {
  /** Visual weight. One primary per view. */
  variant?: ButtonVariant;
  /** Target heights 24 / 32 / 44 px. lg is the touch default. */
  size?: ButtonSize;
  /** Stretches to the container's inline size. */
  isFullWidth?: boolean;
  /** Decorative icon before the label (aria-hidden applied). */
  iconStart?: ReactNode;
  /** Decorative icon after the label (aria-hidden applied). */
  iconEnd?: ReactNode;
  className?: string;
};

/**
 * Icon-only buttons have no visible text, so the accessible name MUST come from aria-label.
 * The discriminated union makes TypeScript refuse an icon-only button without one.
 */
export type ButtonProps =
  | (BaseProps & { children: ReactNode; 'aria-label'?: string })
  | (BaseProps & { children?: undefined; 'aria-label': string });

/**
 * Button — triggers an action or submits a form. Not for navigation (use Link).
 * Behaviour (press handling, keyboard, aria-busy) comes from React Aria; this file only maps props to styles.
 * Spec: ./Button.spec.json · Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', isFullWidth = false, iconStart, iconEnd, className, children, isPending, ...rest },
  ref,
) {
  const classes = [styles.root, styles[variant], styles[size], isFullWidth && styles.fullWidth, !children && styles.iconOnly, className]
    .filter(Boolean)
    .join(' ');

  return (
    <AriaButton ref={ref} className={classes} {...(isPending !== undefined ? { isPending } : {})} {...rest}>
      {iconStart && (
        <span className={styles.icon} aria-hidden="true">
          {iconStart}
        </span>
      )}
      {children && <span className={styles.label}>{children}</span>}
      {iconEnd && (
        <span className={styles.icon} aria-hidden="true">
          {iconEnd}
        </span>
      )}
      {isPending && (
        <span className={styles.spinner} aria-hidden="true">
          <span className="iz-visually-hidden">Loading</span>
        </span>
      )}
    </AriaButton>
  );
});
