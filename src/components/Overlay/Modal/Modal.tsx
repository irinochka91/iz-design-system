import { forwardRef, useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import {
  DialogTrigger as AriaDialogTrigger,
  ModalOverlay as AriaModalOverlay,
  Modal as AriaModal,
  Dialog as AriaDialog,
  Heading as AriaHeading,
} from 'react-aria-components';
import type { ButtonProps } from '../../Actions/Button';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg';
export type ModalPadding = 'md' | 'lg';
export type ModalRole = 'dialog' | 'alertdialog';

type BaseProps = {
  /** Optional opener; omit for a programmatically opened dialog (the ⌘K palette) and control isOpen. */
  trigger?: ReactElement<ButtonProps>;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** ModalBody / ModalFooter — or a function receiving close(). */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** alertdialog for a destructive confirmation; everything else is a dialog. */
  role?: ModalRole;
  /** Max width 400 / 560 / 720 px (10 / 14 / 18 × size.target.lg). */
  size?: ModalSize;
  /** Panel inset 16 / 24 px. The pattern chooses md on phone; no media query here. */
  padding?: ModalPadding;
  /** A click on the backdrop closes. false for destructive confirmations and unsaved input. */
  isDismissable?: boolean;
  /** Escape always closes unless set — then Cancel must be in the footer. */
  isKeyboardDismissDisabled?: boolean;
  className?: string;
};

/** The title is the heading and the name; a dialog without one (the palette) must pass aria-label. */
export type ModalProps =
  | (BaseProps & { title: string; 'aria-label'?: string })
  | (BaseProps & { title?: undefined; 'aria-label': string });

/**
 * Modal — a blocking dialog for a decision that must be made now. Focus moves in, is trapped and
 * returns to the trigger; the rest of the page is hidden from assistive technology and scroll-locked
 * (React Aria). This file maps props to structure and styles. Spec: ./Modal.spec.json
 */
export const Modal = forwardRef<HTMLElement, ModalProps>(function Modal(
  {
    trigger,
    isOpen,
    defaultOpen,
    onOpenChange,
    children,
    role = 'dialog',
    size = 'md',
    padding = 'lg',
    isDismissable = true,
    isKeyboardDismissDisabled = false,
    className,
    title,
    'aria-label': ariaLabel,
  },
  ref,
) {
  const panelClasses = [styles.panel, styles[size], padding === 'md' && styles.paddingMd, className].filter(Boolean).join(' ');

  const overlay = (
    <AriaModalOverlay
      className={styles.overlay ?? ''}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      {...(isOpen !== undefined ? { isOpen } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      <AriaModal className={panelClasses}>
        <AriaDialog ref={ref} role={role} className={styles.dialog ?? ''} {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}>
          {({ close }) => (
            <>
              <FocusFirstControl />
              {title && (
                <AriaHeading slot="title" level={2} className={styles.title ?? ''}>
                  {title}
                </AriaHeading>
              )}
              {typeof children === 'function' ? children(close) : children}
            </>
          )}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );

  // DialogTrigger wires aria-haspopup / aria-expanded onto the Button and restores focus to it on close.
  return trigger ? (
    <AriaDialogTrigger
      {...(isOpen !== undefined ? { isOpen } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {trigger}
      {overlay}
    </AriaDialogTrigger>
  ) : (
    overlay
  );
});

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * React Aria focuses the dialog element itself on open. docs/ACCESSIBILITY.md and APG want the first
 * focusable control (for a confirmation that is Cancel, the least destructive action), falling back to
 * the dialog when there is none. This mounts only while the dialog is open, so a mount effect is exact.
 */
const FocusFirstControl = () => {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // A child's effect runs before React Aria's own focus effect in the ancestors, so defer one macrotask:
    // by then the library has focused the dialog element, and we move focus on to the first control.
    const id = setTimeout(() => {
      const dialog = marker.current?.closest<HTMLElement>('[role="dialog"], [role="alertdialog"]');
      if (!dialog) return;
      const active = document.activeElement;
      if (active && active !== dialog && dialog.contains(active)) return; // something inside already has focus
      dialog.querySelector<HTMLElement>(TABBABLE)?.focus();
    }, 0);
    return () => clearTimeout(id);
  }, []);
  return <span ref={marker} hidden />;
};

/** The content. Scrolls on its own when the dialog is taller than the viewport. */
export const ModalBody = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={[styles.body, className].filter(Boolean).join(' ')}>{children}</div>
);

/** The actions: Cancel first in reading order, the single primary last (trailing edge). */
export const ModalFooter = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={[styles.footer, className].filter(Boolean).join(' ')}>{children}</div>
);
