import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all six themes.
const meta = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  args: { children: 'Open to remote roles', name: 'remote', value: 'yes', size: 'md', onChange: fn() },
  argTypes: { size: { control: 'radio', options: ['md', 'lg'] } },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { defaultSelected: true } };
export const Indeterminate: Story = { args: { children: 'Select all leads', isIndeterminate: true } };
export const WithDescription: Story = {
  args: { children: 'I agree to the terms', description: 'We store the lead in your tracker only.' },
};
export const Required: Story = { args: { children: 'I agree to the terms', isRequired: true } };

/** Invalid is never colour-only: thicker danger border, error text, aria-invalid + aria-describedby. */
export const Invalid: Story = {
  args: { children: 'I agree to the terms', isRequired: true, isInvalid: true, errorMessage: 'Tick to continue' },
};
export const Disabled: Story = { args: { isDisabled: true, defaultSelected: true } };
export const ReadOnly: Story = { args: { isReadOnly: true, defaultSelected: true, description: 'Set by the lead source.' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <Checkbox {...args} size="md">Medium row 24px</Checkbox>
      <Checkbox {...args} size="lg">Large row 44px</Checkbox>
    </div>
  ),
};

/** A bare box in a table row: aria-label is required and must name the thing, not just say "Select". */
export const BareBox: Story = {
  args: { children: undefined, 'aria-label': 'Select Orbit — Senior Product Designer' },
};

export const LongUkrainianLabel: Story = {
  args: { children: 'Погоджуюся отримувати щоденний дайджест із діями на сьогодні та новими вакансіями', description: 'Можна вимкнути будь-коли.' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from Checkbox.spec.json: Tab focuses the box, Space toggles, Enter does nothing. */
export const Keyboard: Story = {
  args: { children: 'Press Space' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Press Space' });
    await userEvent.tab();
    await expect(box).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Enter}');
    await expect(box).toBeChecked(); // Enter is not a toggle
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};
