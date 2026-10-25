// Public API of @iz/design-system.
// Every component is exported from here and only from here (docs/CONTRIBUTING.md).
// Components arrive one per learning cycle — see docs/ROADMAP.md.
import './styles/index.css';

export const VERSION = '0.0.1';

// Actions
export { Button } from './components/Actions/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Actions/Button';

// Inputs
export { TextField } from './components/Inputs/TextField';
export type { TextFieldProps, TextFieldSize, TextFieldType } from './components/Inputs/TextField';
