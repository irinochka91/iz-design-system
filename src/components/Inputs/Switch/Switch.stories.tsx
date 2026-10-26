import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all six themes.
const meta = {
  title: 'Inputs/Switch',
  component: Switch,
  args: { children: 'Focus timer', size: 'md', onChange: fn() },
  argTypes: {
    size: { control: 'radio', options: ['md', 'lg'] },
    labelPlacement: { control: 'radio', options: ['end', 'start'] },
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const On: Story = { args: { defaultSelected: true } };
export const WithDescription: Story = { args: { description: '25 minutes, then a short break.' } };

/** The settings-list layout: text first, switch at the row's end. DOM order and the name do not change. */
export const LabelStart: Story = {
  args: { children: 'Follow system theme', labelPlacement: 'start', defaultSelected: true },
};
export const Disabled: Story = { args: { isDisabled: true, defaultSelected: true } };
export const ReadOnly: Story = {
  args: { children: 'Weekly summary email', isReadOnly: true, defaultSelected: true, description: 'Included in the 90-day pass.' },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <Switch {...args} size="md">Medium row 24px</Switch>
      <Switch {...args} size="lg">Large row 44px</Switch>
    </div>
  ),
};

/** A bare switch in a row that already shows the text: aria-label must name the setting. */
export const Bare: Story = {
  args: { children: undefined, 'aria-label': 'Reminders for overdue actions' },
};

/** Keyboard contract from Switch.spec.json: Tab focuses, Space toggles and applies at once. */
export const Keyboard: Story = {
  args: { children: 'Press Space' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('switch', { name: 'Press Space' });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(input).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(input).not.toBeChecked();
  },
};
