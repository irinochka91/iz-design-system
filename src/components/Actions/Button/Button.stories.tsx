import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all four themes.
const meta = {
  title: 'Actions/Button',
  component: Button,
  args: { children: 'Save changes', variant: 'primary', size: 'md', onPress: fn() },
  argTypes: {
    variant: { control: 'radio', options: ['primary', 'secondary', 'tertiary', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete vacancy' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <Button {...args} size="sm">Small 24px</Button>
      <Button {...args} size="md">Medium 40px</Button>
      <Button {...args} size="lg">Large 44px</Button>
    </div>
  ),
};

export const Disabled: Story = { args: { isDisabled: true } };
export const Pending: Story = { args: { isPending: true, children: 'Saving' } };
export const FullWidth: Story = { args: { isFullWidth: true } };

const Icon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const WithIcon: Story = { args: { iconEnd: <Icon />, children: 'Continue' } };

/** Icon-only: TypeScript requires aria-label here; axe would fail without it. */
export const IconOnly: Story = { args: { children: undefined, 'aria-label': 'Continue', iconStart: <Icon /> } };

export const LongUkrainianLabel: Story = {
  args: { children: 'Надіслати заявку на вакансію старшого продуктового дизайнера' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from Button.spec.json: Tab focuses, Enter and Space activate, focus ring is visible. */
export const Keyboard: Story = {
  args: { children: 'Press me' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Press me' });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('data-focus-visible');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};
