import { forwardRef, type ReactNode } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'surface' | 'raised';
export type CardPadding = 'md' | 'lg';
export type CardRadius = 'lg' | 'xl';
export type CardElement = 'div' | 'section' | 'article' | 'li';

export type CardProps = {
  children?: ReactNode;
  /** Which surface token the box sits on: page cards (surface) or an overlay's body (raised). */
  variant?: CardVariant;
  /** Inset 16 / 24 px. md is the phone value — the pattern chooses it; Card never reads the viewport. */
  padding?: CardPadding;
  /** 12 / 14 px. xl is the triage card. */
  radius?: CardRadius;
  /** section + aria-labelledby = a named region; article = a self-contained item; li inside a list of cards. */
  as?: CardElement;
  /** Required with as="section": the id of the heading that names the region. */
  'aria-labelledby'?: string;
  className?: string;
};

/**
 * Card — a bordered box on a surface. Never interactive as a whole, no shadow, no outer margin, no
 * media query. Everything a screen reader hears comes from the content; the card is silent.
 * Spec: ./Card.spec.json
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { children, variant = 'surface', padding = 'lg', radius = 'lg', as = 'div', className, ...rest },
  ref,
) {
  // Polymorphic tag: JSX would intersect the ref types of all four elements. The props we pass are
  // shared by every HTMLElement, so typing the tag as 'div' is honest and keeps the ref typed.
  const Element = as as 'div';
  // CSS Modules classes are camelCase (stylelint selector-class-pattern); map the prop values explicitly.
  const classes = [
    styles.root,
    styles[variant],
    padding === 'md' && styles.paddingMd,
    radius === 'xl' && styles.radiusXl,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const labelledBy = rest['aria-labelledby'];

  return (
    <Element
      ref={ref as React.Ref<HTMLDivElement>}
      className={classes}
      {...(labelledBy !== undefined ? { 'aria-labelledby': labelledBy } : {})}
    >
      {children}
    </Element>
  );
});
