// Public API of @iz/design-system.
// Every component is exported from here and only from here (docs/CONTRIBUTING.md).
// Components arrive one per learning cycle — see docs/ROADMAP.md.
import './styles/index.css';

export const VERSION = '0.0.1';

// Actions
export { Button } from './components/Actions/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Actions/Button';

export { Menu, MenuItem, MenuSection, MenuHeader, MenuSeparator, MenuDescription, MenuKeyboard } from './components/Actions/Menu';
export type { MenuProps, MenuItemProps, MenuSectionProps, MenuPlacement, MenuSelectionMode } from './components/Actions/Menu';

// Inputs
export { TextField } from './components/Inputs/TextField';
export type { TextFieldProps, TextFieldSize, TextFieldType } from './components/Inputs/TextField';
export { Checkbox } from './components/Inputs/Checkbox';
export type { CheckboxProps, CheckboxSize } from './components/Inputs/Checkbox';
export { Switch } from './components/Inputs/Switch';
export type { SwitchProps, SwitchSize, SwitchLabelPlacement } from './components/Inputs/Switch';
export { RadioGroup, Radio } from './components/Inputs/RadioGroup';
export type { RadioGroupProps, RadioProps, RadioGroupSize, RadioGroupOrientation } from './components/Inputs/RadioGroup';
export { ComboBox, ComboBoxItem, ComboBoxSection, ComboBoxHeader, ComboBoxDescription } from './components/Inputs/ComboBox';
export type { ComboBoxProps, ComboBoxItemProps, ComboBoxSectionProps, ComboBoxSize, ComboBoxMenuTrigger } from './components/Inputs/ComboBox';

// Display
export { Chip } from './components/Display/Chip';
export type { ChipProps, ChipVariant, ChipEmphasis, ChipPropertyProps, ChipStageProps, ChipFilterProps } from './components/Display/Chip';
export { Card } from './components/Display/Card';
export type { CardProps, CardVariant, CardPadding, CardRadius, CardElement } from './components/Display/Card';

// Feedback
export { Toast } from './components/Feedback/Toast';
export type { ToastProps, ToastCloseReason } from './components/Feedback/Toast';

// Overlay
export { Modal, ModalBody, ModalFooter } from './components/Overlay/Modal';
export type { ModalProps, ModalSize, ModalPadding, ModalRole } from './components/Overlay/Modal';
export { Popover } from './components/Overlay/Popover';
export type { PopoverProps, PopoverPlacement, PopoverSize, PopoverPadding } from './components/Overlay/Popover';
export { Tooltip } from './components/Overlay/Tooltip';
export type { TooltipProps, TooltipPlacement, TooltipShowOn } from './components/Overlay/Tooltip';

// Patterns — Job Search HQ (ADR-033)
export { ActionRow } from './patterns/jobsearch/ActionRow';
export type { ActionRowProps, Action, ActionStage, ActionGroup, SnoozePreset } from './patterns/jobsearch/ActionRow';
export { StageChip, STAGES, stageEmphasis } from './patterns/jobsearch/StageChip';
export type { StageChipProps, Stage, TerminalStage } from './patterns/jobsearch/StageChip';
export { WeeklyGoal, weeklyGoalFooter } from './patterns/jobsearch/WeeklyGoal';
export type { WeeklyGoalProps } from './patterns/jobsearch/WeeklyGoal';
