import { forwardRef, type ReactElement } from 'react';
import {
  TooltipTrigger as AriaTooltipTrigger,
  Tooltip as AriaTooltip,
  OverlayArrow as AriaOverlayArrow,
} from 'react-aria-components';
import type { ButtonProps } from '../../Actions/Button';
import { useTokenPx } from '../useTokenPx';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TooltipShowOn = 'hover' | 'focus';

export type TooltipProps = {
  /** The focusable control the tooltip describes; React Aria adds aria-describedby while shown. */
  trigger: ReactElement<ButtonProps>;
  /** The hint. Plain text, one line or two. */
  children: string;
  placement?: TooltipPlacement;
  /** 'hover' = pointer hover AND keyboard focus; 'focus' = keyboard focus only. */
  showOn?: TooltipShowOn;
  /** Hover warm-up in ms (keyboard focus shows immediately). */
  delay?: number;
  /** ms it stays after the pointer leaves, so it can be moved onto the tooltip (WCAG 1.4.13). */
  closeDelay?: number;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showArrow?: boolean;
  className?: string;
};

/**
 * Tooltip — a short plain-text hint describing a focusable control, shown on keyboard-visible focus and
 * after a hover delay, dismissed with Escape. Supplementary: the control makes sense without it, and an
 * icon-only button keeps its aria-label. Show/hide, warm-up, hover persistence, Escape and
 * aria-describedby come from React Aria. Spec: ./Tooltip.spec.json
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    trigger,
    children,
    placement = 'top',
    showOn = 'hover',
    delay,
    closeDelay,
    isDisabled,
    isOpen,
    defaultOpen,
    onOpenChange,
    showArrow = true,
    className,
  },
  ref,
) {
  const offset = useTokenPx('--iz-space-200', 8);
  return (
    <AriaTooltipTrigger
      {...(showOn === 'focus' ? { trigger: 'focus' as const } : {})}
      {...(delay !== undefined ? { delay } : {})}
      {...(closeDelay !== undefined ? { closeDelay } : {})}
      {...(isDisabled !== undefined ? { isDisabled } : {})}
      {...(isOpen !== undefined ? { isOpen } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {trigger}
      <AriaTooltip ref={ref} placement={placement} offset={offset} className={[styles.tooltip, className].filter(Boolean).join(' ')}>
        {showArrow && (
          <AriaOverlayArrow className={styles.arrow ?? ''}>
            <svg viewBox="0 0 8 8" width="8" height="8" aria-hidden="true">
              <path d="M0 0 L4 4 L8 0" />
            </svg>
          </AriaOverlayArrow>
        )}
        {children}
      </AriaTooltip>
    </AriaTooltipTrigger>
  );
});
