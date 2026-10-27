import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import {
  Button as AriaButton,
  ToggleButton as AriaToggleButton,
  type PressEvent,
} from 'react-aria-components';
import styles from './Chip.module.css';

export type ChipVariant = 'property' | 'stage' | 'filter';
export type ChipEmphasis = 'quiet' | 'tint' | 'strong';

type CommonProps = {
  /** The visible label and the accessible name. Short: 'Orbit', 'Interview', 'Hybrid'. */
  children: ReactNode;
  /** Visual weight without semantic meaning. One `strong` per screen — it is the accent. */
  emphasis?: ChipEmphasis;
  /** Decorative, aria-hidden. The meaning must also be in text (see the spec). */
  iconStart?: ReactNode;
  className?: string;
};

/** Static fact: company, location. A <span>, no role. */
export type ChipPropertyProps = CommonProps & { variant?: 'property' };

/** Pipeline stage. A <span> — or a <button> that advances the stage when onPress is given. */
export type ChipStageProps = CommonProps & {
  variant: 'stage';
  onPress?: (e: PressEvent) => void;
  /** Only with onPress: what pressing does — 'Stage: Screen. Press to advance'. */
  'aria-label'?: string;
  /** Only with onPress: the StageChip pattern binds Shift+→ / Shift+← on the button itself here. */
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  isDisabled?: boolean;
};

/** Toggle with aria-pressed. Selected is never colour-only. */
export type ChipFilterProps = CommonProps & {
  variant: 'filter';
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
};

/** The variant decides the element; the union makes onChange on a stage or onPress on a filter a type error. */
export type ChipProps = ChipPropertyProps | ChipStageProps | ChipFilterProps;

/**
 * Chip — a 28 px pill with a short label. property and stage are static <span>s; filter is a
 * <button aria-pressed>; a stage with onPress is a <button>. Behaviour (press, toggle, aria-pressed,
 * focus-visible) comes from React Aria; this file maps props to element and styles.
 * Spec: ./Chip.spec.json
 */
export const Chip = forwardRef<HTMLElement, ChipProps>(function Chip(props, ref) {
  const { children, emphasis = 'quiet', iconStart, className } = props;
  const variant = props.variant ?? 'property';
  const classes = (...extra: Array<string | undefined | false>) =>
    [styles.root, styles[variant], styles[emphasis], ...extra, className].filter(Boolean).join(' ');

  const content = (
    <>
      {iconStart && (
        <span className={styles.icon} aria-hidden="true">
          {iconStart}
        </span>
      )}
      <span className={styles.label}>{children}</span>
    </>
  );

  if (props.variant === 'filter') {
    const { isSelected, defaultSelected, onChange, isDisabled } = props;
    return (
      <AriaToggleButton
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes(styles.interactive)}
        {...(isSelected !== undefined ? { isSelected } : {})}
        {...(defaultSelected !== undefined ? { defaultSelected } : {})}
        {...(onChange !== undefined ? { onChange } : {})}
        {...(isDisabled !== undefined ? { isDisabled } : {})}
      >
        {content}
      </AriaToggleButton>
    );
  }

  if (props.variant === 'stage' && props.onPress) {
    const { onPress, onKeyDown, isDisabled } = props;
    return (
      <AriaButton
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes(styles.interactive)}
        onPress={onPress}
        {...(onKeyDown !== undefined ? { onKeyDown } : {})}
        {...(props['aria-label'] !== undefined ? { 'aria-label': props['aria-label'] } : {})}
        {...(isDisabled !== undefined ? { isDisabled } : {})}
      >
        {content}
      </AriaButton>
    );
  }

  // Static: no role, no tab stop, nothing to announce beyond the text.
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={classes()}>
      {content}
    </span>
  );
});
