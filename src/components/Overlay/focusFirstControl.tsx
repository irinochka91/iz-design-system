import { useEffect, useRef } from 'react';

const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * React Aria focuses the dialog element itself on open. docs/ACCESSIBILITY.md and APG want the first
 * focusable control (for a confirmation that is Cancel, the least destructive action), falling back to
 * the dialog when there is none. Rendered inside a Dialog, so it mounts only while the overlay is open.
 * A child's effect runs before the ancestor's focus effect, so the move is deferred one macrotask.
 * Shared by Modal and Popover.
 */
export const FocusFirstControl = () => {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
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
