import { forwardRef, type ReactElement, type ReactNode } from 'react';
import {
  MenuTrigger as AriaMenuTrigger,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  Header as AriaHeader,
  Separator as AriaSeparator,
  Keyboard as AriaKeyboard,
  Text as AriaText,
  Popover as AriaPopover,
  type Key,
  type MenuItemProps as AriaMenuItemProps,
  type MenuSectionProps as AriaMenuSectionProps,
} from 'react-aria-components';
import type { ButtonProps } from '../Button';
import styles from './Menu.module.css';

export type MenuPlacement = 'bottom start' | 'bottom end' | 'top start' | 'top end';
export type MenuSelectionMode = 'none' | 'single';

export type MenuProps = {
  /** The Button that opens the menu; React Aria wires aria-haspopup / aria-expanded onto it. */
  trigger: ReactElement<ButtonProps>;
  /** MenuItem | MenuSection | MenuSeparator */
  children: ReactNode;
  /** Fires with the chosen item's id. */
  onAction?: (key: Key) => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Preferred side and alignment; flips when there is no room. */
  placement?: MenuPlacement;
  /** none = actions (menuitem); single = one checked option (menuitemradio + aria-checked). */
  selectionMode?: MenuSelectionMode;
  /** single mode only: the checked item. */
  selectedKey?: Key;
  disabledKeys?: Iterable<Key>;
  /** Name of the menu when the trigger's text does not describe it. */
  'aria-label'?: string;
  shouldCloseOnSelect?: boolean;
  className?: string;
};

/**
 * Menu — a list of actions behind a trigger Button, in a non-modal popover. Open/close, roving focus,
 * type-ahead, wrap, Escape, Tab-out and focus return all come from React Aria; this file maps props to
 * structure and styles. Spec: ./Menu.spec.json · Pattern: APG Menu Button.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    trigger,
    children,
    onAction,
    isOpen,
    defaultOpen,
    onOpenChange,
    placement = 'bottom start',
    selectionMode = 'none',
    selectedKey,
    disabledKeys,
    'aria-label': ariaLabel,
    shouldCloseOnSelect,
    className,
  },
  ref,
) {
  return (
    <AriaMenuTrigger
      {...(isOpen !== undefined ? { isOpen } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange !== undefined ? { onOpenChange } : {})}
    >
      {trigger}
      <AriaPopover placement={placement} className={[styles.popover, className].filter(Boolean).join(' ')}>
        <AriaMenu
          ref={ref}
          className={styles.menu ?? ''}
          selectionMode={selectionMode}
          {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
          {...(onAction !== undefined ? { onAction } : {})}
          {...(selectedKey !== undefined ? { selectedKeys: new Set([selectedKey]) } : {})}
          {...(disabledKeys !== undefined ? { disabledKeys } : {})}
          {...(shouldCloseOnSelect !== undefined ? { shouldCloseOnSelect } : {})}
        >
          {children}
        </AriaMenu>
      </AriaPopover>
    </AriaMenuTrigger>
  );
});

export type MenuItemProps = Omit<AriaMenuItemProps, 'className' | 'style' | 'children'> & {
  children: ReactNode;
  className?: string;
};

/** One action. Label text, optionally a MenuDescription and a MenuKeyboard hint — never nested controls. */
export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem({ children, className, ...rest }, ref) {
  return (
    <AriaMenuItem ref={ref} className={[styles.item, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </AriaMenuItem>
  );
});

export type MenuSectionProps = Omit<AriaMenuSectionProps<object>, 'className' | 'style' | 'children'> & {
  children: ReactNode;
  className?: string;
};

/** A group of items, usually with a MenuHeader as its first child. */
export const MenuSection = forwardRef<HTMLElement, MenuSectionProps>(function MenuSection({ children, className, ...rest }, ref) {
  return (
    <AriaMenuSection ref={ref} className={[styles.section, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </AriaMenuSection>
  );
});

/** The section's visible heading (announced as the group name). */
export const MenuHeader = ({ children }: { children: ReactNode }) => <AriaHeader className={styles.header ?? ''}>{children}</AriaHeader>;

export const MenuSeparator = () => <AriaSeparator className={styles.separator ?? ''} />;

/** Secondary text under the label, read after it. */
export const MenuDescription = ({ children }: { children: ReactNode }) => (
  <AriaText slot="description" className={styles.description ?? ''}>
    {children}
  </AriaText>
);

/** The shortcut that triggers the same action outside the menu; informative text, read after the label. */
export const MenuKeyboard = ({ children }: { children: ReactNode }) => <AriaKeyboard className={styles.kbd ?? ''}>{children}</AriaKeyboard>;
