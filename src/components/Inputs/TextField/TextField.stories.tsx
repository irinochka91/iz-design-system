import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { TextField } from './TextField';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all six themes.
const meta = {
  title: 'Inputs/TextField',
  component: TextField,
  args: { label: 'Company', name: 'company', autoComplete: 'organization', size: 'md', onChange: fn() },
  argTypes: {
    size: { control: 'radio', options: ['md', 'lg'] },
    type: { control: 'select', options: ['text', 'email', 'url', 'tel', 'search', 'password'] },
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { label: 'Email', type: 'email', autoComplete: 'email', description: 'We only use this for the digest.' },
};
export const Required: Story = { args: { isRequired: true } };

/** Invalid is never colour-only: thicker danger border, error text, aria-invalid + aria-describedby. */
export const Invalid: Story = {
  args: { label: 'Salary floor', inputMode: 'numeric', isInvalid: true, errorMessage: 'Enter a number, e.g. 120000', defaultValue: '120k' },
};
export const Disabled: Story = { args: { isDisabled: true, defaultValue: 'Orbit' } };
export const ReadOnly: Story = { args: { isReadOnly: true, defaultValue: 'Orbit', description: 'Set by the lead source.' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <TextField {...args} size="md" label="Medium 40px" />
      <TextField {...args} size="lg" label="Large 44px" />
    </div>
  ),
};

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </svg>
);

/** The Today quick-add row: no visible label, so aria-label is required; kbd hint is decorative. */
export const QuickAdd: Story = {
  args: {
    label: undefined,
    'aria-label': 'Add an action',
    placeholder: 'Email Priya @Orbit tomorrow 10am',
    kbdHint: 'N',
    iconStart: <SearchIcon />,
    isFullWidth: true,
  },
};

export const LongUkrainianLabel: Story = {
  args: { label: 'Назва компанії, до якої ви подаєтеся на вакансію', description: 'Так, як вона пише себе сама.' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from TextField.spec.json: Tab focuses, typing edits, Enter and Escape are left alone. */
export const Keyboard: Story = {
  args: { label: 'Type here' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Type here' });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('data-focus-visible');
    await userEvent.keyboard('Orbit');
    await expect(args.onChange).toHaveBeenLastCalledWith('Orbit');
    // The field does not own Enter or Escape: the value survives both.
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('Orbit');
  },
};
