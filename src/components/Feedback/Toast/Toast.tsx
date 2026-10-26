import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from '../../Actions/Button';
import styles from './Toast.module.css';

export type ToastCloseReason = 'timeout' | 'dismiss' | 'action';

export type ToastProps = {
  /** Controlled. A new message while open replaces the content and restarts the timer. */
  isOpen: boolean;
  /** The timer ran out, Escape / the close button, or the action was taken. The owner sets isOpen=false. */
  onClose: (reason: ToastCloseReason) => void;
  /** One short sentence. Read once, gone in 6 s. */
  children?: ReactNode;
  /** An optional single action (Undo), rendered as a tertiary Button. Must also exist elsewhere. */
  action?: { label: string; onPress: () => void };
  /** ms before auto-dismiss. Never below 5000; 0 = persistent (only with an action). Pauses on hover/focus. */
  timeout?: number;
  /** Change it to re-announce identical text (a live region speaks only on content change). */
  announceKey?: string | number;
  /** Accessible name of the landmark region. Localise it. */
  regionLabel?: string;
  /** Accessible name of the close button. Localise it. */
  dismissLabel?: string;
  className?: string;
};

const MIN_TIMEOUT = 5000;

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

/**
 * Toast — a polite status at the bottom-centre: role="status" in an always-mounted live region inside a
 * named landmark. Never steals focus; one at a time, the new one replaces the old; 6 s with pause while
 * hovered or focused; Escape dismisses only while focus is inside. Built on React events and the system
 * Button rather than UNSTABLE_Toast (ADR-028).
 * Spec: ./Toast.spec.json
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    isOpen,
    onClose,
    children,
    action,
    timeout = 6000,
    announceKey,
    regionLabel = 'Notifications',
    dismissLabel = 'Dismiss',
    className,
  },
  ref,
) {
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  // Latest-callback ref, written in an effect (never during render — React Compiler rule).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Reset the pause when the open state flips, using the documented "previous prop" pattern instead of
  // an effect (setState in an effect cascades renders). The next toast then starts its own clock.
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    setPaused(false);
  }

  // 0 = persistent; anything else is clamped to the 5 s floor (docs/ACCESSIBILITY.md, WCAG 2.2.1).
  const effectiveTimeout = timeout === 0 ? 0 : Math.max(timeout, MIN_TIMEOUT);

  // (Re)start the timer whenever the toast opens, its content changes, or a pause ends.
  useEffect(() => {
    if (!isOpen || paused || effectiveTimeout === 0) return undefined;
    const id = setTimeout(() => onCloseRef.current('timeout'), effectiveTimeout);
    return () => clearTimeout(id);
  }, [isOpen, paused, effectiveTimeout, children, announceKey]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  // Pointer pause is wired imperatively: resting the pointer over the toast is not an interaction *with*
  // the landmark, and jsx-a11y rightly refuses mouse handlers on a non-interactive role. Focus pause
  // stays in JSX (onFocus/onBlur are not interaction handlers).
  useImperativeHandle(ref, () => regionRef.current as HTMLDivElement);
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return undefined;
    el.addEventListener('pointerenter', pause);
    el.addEventListener('pointerleave', resume);
    return () => {
      el.removeEventListener('pointerenter', pause);
      el.removeEventListener('pointerleave', resume);
    };
  }, [pause, resume]);
  // Focus pause lives on the two buttons — the only focusable things in the toast. Resume only when
  // focus leaves the region, not when it moves between Undo and Dismiss.
  const onBlurInside = useCallback((e: FocusEvent<Element>) => {
    if (!regionRef.current?.contains(e.relatedTarget as Node | null)) setPaused(false);
  }, []);
  // Escape lives on the two buttons — the only places focus can be "inside" the toast — so a global
  // Escape (Dialog, quick-add) is never intercepted, and no listener sits on a non-interactive element.
  const onEscape = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCloseRef.current('dismiss');
    }
  }, []);

  const classes = [styles.region, className].filter(Boolean).join(' ');

  return (
    // The landmark has no JSX handlers (jsx-a11y): pointer pause is attached in the effect above, focus
    // pause sits on the buttons.
    <div
      ref={regionRef}
      role="region"
      aria-label={regionLabel}
      className={classes}
      data-paused={paused || undefined}
    >
      {/* The live region is always mounted, even while closed, so assistive tech has registered it
          before the first message arrives — otherwise the first toast is often not announced. */}
      <div className={styles.toast} hidden={!isOpen}>
        <div key={announceKey ?? 'message'} role="status" aria-live="polite" aria-atomic="true" className={styles.message}>
          {isOpen ? children : null}
        </div>
        {isOpen && action && (
          <Button
            variant="tertiary"
            onFocus={pause}
            onBlur={onBlurInside}
            onKeyDown={onEscape}
            onPress={() => {
              action.onPress();
              onCloseRef.current('action');
            }}
          >
            {action.label}
          </Button>
        )}
        {isOpen && (
          <Button variant="tertiary" aria-label={dismissLabel} iconStart={<CloseIcon />} onFocus={pause} onBlur={onBlurInside} onKeyDown={onEscape} onPress={() => onCloseRef.current('dismiss')} />
        )}
      </div>
    </div>
  );
});
