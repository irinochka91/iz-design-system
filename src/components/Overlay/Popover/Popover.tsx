import { forwardRef, type ReactElement, type ReactNode } from 'react';
import {
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  OverlayArrow as AriaOverlayArrow,
  Dialog as AriaDialog,
  Heading as AriaHeading,
} from 'react-aria-components';
import type { ButtonProps } from '../../Actions/Button';
import { FocusFirstControl } from '../focusFirstControl';
import { useTokenPx } from '../useTokenPx';
import styles from './Popover.module.css';

export type PopoverPlacement = 'bottom start' | 'bottom' | 'bottom end' | 'top start' | 'top' | 'top end' | 'start' | 'end';
export type PopoverSize = 'sm' | 'md';
export type PopoverPadding = 'sm' | 'md';

type BaseProps = {
  /** The Button it is anchored to. */
  trigger: ReactElement<ButtonProps>;
  /** A couple of controls or a sentence — or a function receiving close(). */
  children: ReactNode | ((close: () => void) => ReactNode);
  placement?: PopoverPlacement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Combobox-style surfaces only, never a form: the page stays reachable and focus leaving closes it. */
  isNonModal?: boolean;
  isKeyboardDismissDisabled?: boolean;
  /** A decorative arrow pointing at the trigger. */
  showArrow?: boolean;
  /** Max width 320 / 400 px. */
  size?: PopoverSize;
  /** Inset 8 / 16 px. */
  padding?: PopoverPadding;
  className?: string;
};

/** Named by a title (h3) or aria-label; the union requires one of the two. */
export type PopoverProps =
  | (BaseProps & { title: string; 'aria-label'?: string })
  | (BaseProps & { title?: undefined; 'aria-label': string });

/**
 * Popover — a small surface anchored to its trigger: one or two controls or a sentence. Modal for
 * assistive technology by default (Menu precedent, ADR-029); isNonModal for combobox-style surfaces only.
 * Open/close, positioning, flip, dismiss, hide-outside and focus return come from React Aria.
 * Spec: ./Popover.spec.json
 */
export const Popover = forwardRef<HTMLElement, PopoverProps>(function Popover(
  {
    trigger,
    children,
    placement = 'bottom',
    isOpen,
    defaultOpen,
    onOpenChange,
    isNonModal = false,
    isKeyboardDismissDisabled = false,
    showArrow = false,
    size = 'sm',
    padding = 'md',
    className,
    title,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const offset = useTokenPx('--iz-space-200', 8);
  const classes = [styles.popover, styles[size], padding === 'sm' && styles.paddingSm, className].filter(Boolean).join(' ');

  return (
    <AriaDialogTrigger
      {...(isOpen !== undefined ? { isOpen } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {trigger}
      <AriaPopover
        className={classes}
        placement={placement}
        offset={offset}
        isNonModal={isNonModal}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      >
        {showArrow && (
          <AriaOverlayArrow className={styles.arrow ?? ''}>
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M0 0 L6 6 L12 0" />
            </svg>
          </AriaOverlayArrow>
        )}
        <AriaDialog ref={ref} className={styles.dialog ?? ''} {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}>
          {({ close }) => (
            <>
              <FocusFirstControl />
              {title && (
                <AriaHeading slot="title" level={3} className={styles.title ?? ''}>
                  {title}
                </AriaHeading>
              )}
              {typeof children === 'function' ? children(close) : children}
            </>
          )}
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
});
