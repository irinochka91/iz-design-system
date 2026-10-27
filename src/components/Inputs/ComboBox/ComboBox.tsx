import { forwardRef, useRef, type ReactNode, type Ref } from 'react';
import {
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  Button as AriaButton,
  Input as AriaInput,
  Label,
  Text,
  Popover as AriaPopover,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
  ListBoxSection as AriaListBoxSection,
  type ListBoxSectionProps as AriaListBoxSectionProps,
  Header as AriaHeader,
} from 'react-aria-components';
import { useTokenPx } from '../../Overlay/useTokenPx';
import styles from './ComboBox.module.css';

export type ComboBoxSize = 'md' | 'lg';
export type ComboBoxMenuTrigger = 'input' | 'focus' | 'manual';

type BaseProps<T extends object> = Omit<AriaComboBoxProps<T>, 'children' | 'className' | 'style' | 'allowsEmptyCollection'> & {
  /** Static ComboBoxItem / ComboBoxSection elements, or a render function used with items / defaultItems. */
  children: ReactNode | ((item: T) => ReactNode);
  /** Help text under the field, linked by aria-describedby. */
  description?: string;
  /** Shown when isInvalid. Its element is always in the DOM so the announcement is immediate. */
  errorMessage?: string;
  /** Shown in the list when the filter leaves nothing. Not shown for new text when allowsCustomValue. */
  emptyMessage?: string;
  /** Example value only, in muted text. Never the label. */
  placeholder?: string;
  /** Field heights 40 / 44 px (size.target.lg / size.target.touch), same as TextField. */
  size?: ComboBoxSize;
  isFullWidth?: boolean;
  /** The native input, for focus management in a pattern (quick-add's N shortcut). */
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
};

/** A visible label is the default; aria-label is the only way to drop it. TypeScript refuses a field with neither. */
export type ComboBoxProps<T extends object> =
  | (BaseProps<T> & { label: string; 'aria-label'?: string })
  | (BaseProps<T> & { label?: undefined; 'aria-label': string });

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m4 6 4 4 4-4" />
  </svg>
);

/**
 * ComboBox — a text field with filtered suggestions. Filtering, open/close, aria-autocomplete,
 * aria-activedescendant, the non-modal list, Enter/Escape/blur commit rules and the result-count
 * announcement all come from React Aria; this file maps props to structure and styles.
 * Spec: ./ComboBox.spec.json · Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */
export function ComboBox<T extends object>({
  label,
  children,
  description,
  errorMessage,
  emptyMessage = 'No matches',
  placeholder,
  size = 'md',
  isFullWidth = false,
  inputRef,
  className,
  isInvalid,
  isRequired,
  allowsCustomValue,
  ...rest
}: ComboBoxProps<T>) {
  const classes = [styles.root, styles[size], isFullWidth && styles.fullWidth, className].filter(Boolean).join(' ');
  const offset = useTokenPx('--iz-space-200', 8);
  // React Aria positions the list against its own trigger (the input); the list must align with the
  // whole field box, so the box is the trigger. (Its width comes from --trigger-width; see the CSS.)
  const fieldRef = useRef<HTMLDivElement>(null);
  return (
    <AriaComboBox
      className={classes}
      // aria, not native (ADR-022): isInvalid stays controlled, isRequired emits aria-required, no browser bubble.
      validationBehavior="aria"
      // Keep the list open on an empty filter so emptyMessage is seen and read — unless new text is itself
      // the result (allowsCustomValue), when an empty list would only be noise.
      allowsEmptyCollection={!allowsCustomValue}
      {...(allowsCustomValue !== undefined ? { allowsCustomValue } : {})}
      {...(isInvalid !== undefined ? { isInvalid } : {})}
      {...(isRequired !== undefined ? { isRequired } : {})}
      {...rest}
    >
      {label && (
        <Label className={styles.label}>
          {label}
          {isRequired && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {/* The box is the target: border, background and focus ring live here; the toggle shares the ring. */}
      <div ref={fieldRef} className={styles.field}>
        <AriaInput {...(inputRef ? { ref: inputRef } : {})} className={styles.input ?? ''} {...(placeholder !== undefined ? { placeholder } : {})} />
        {/* React Aria names it "Show suggestions" and labels it by the field's label. */}
        <AriaButton className={styles.toggle ?? ''}>
          <Chevron />
        </AriaButton>
      </div>
      {description && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
      {/* Always rendered — empty while valid — so aria-describedby is stable and the error is announced
          the moment isInvalid flips (same contract as TextField). */}
      <Text slot="errorMessage" className={styles.error}>
        {isInvalid ? errorMessage : ''}
      </Text>
      {/* Inside a ComboBox, React Aria's Popover is non-modal: focus stays in the input (ADR-029's one exception). */}
      <AriaPopover triggerRef={fieldRef} offset={offset} className={styles.popover ?? ''} {...(isInvalid ? { 'data-invalid': true } : {})}>
        <AriaListBox<T> className={styles.listbox ?? ''} renderEmptyState={() => <div className={styles.empty}>{emptyMessage}</div>}>
          {children}
        </AriaListBox>
      </AriaPopover>
    </AriaComboBox>
  );
}

export type ComboBoxItemProps = Omit<AriaListBoxItemProps, 'className' | 'style' | 'children'> & {
  /** The option's label; optionally a ComboBoxDescription after it. Plain text — never a control. */
  children: ReactNode;
  className?: string;
};

/** One option. Pass textValue when children is not a plain string. */
export const ComboBoxItem = forwardRef<HTMLDivElement, ComboBoxItemProps>(function ComboBoxItem({ children, className, ...rest }, ref) {
  return (
    <AriaListBoxItem ref={ref} className={[styles.option, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </AriaListBoxItem>
  );
});

export type ComboBoxSectionProps = Omit<AriaListBoxSectionProps<object>, 'className' | 'style' | 'children'> & {
  children: ReactNode;
  className?: string;
};

/** A named group of options, usually with a ComboBoxHeader as its first child. */
export const ComboBoxSection = forwardRef<HTMLElement, ComboBoxSectionProps>(function ComboBoxSection({ children, className, ...rest }, ref) {
  return (
    <AriaListBoxSection ref={ref} className={[styles.section, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </AriaListBoxSection>
  );
});

/** The section's visible heading (announced as the group name; not an option). */
export const ComboBoxHeader = ({ children }: { children: ReactNode }) => <AriaHeader className={styles.header ?? ''}>{children}</AriaHeader>;

/** Secondary text after an option's label, read after it. */
export const ComboBoxDescription = ({ children }: { children: ReactNode }) => (
  <Text slot="description" className={styles.optionDescription ?? ''}>
    {children}
  </Text>
);
