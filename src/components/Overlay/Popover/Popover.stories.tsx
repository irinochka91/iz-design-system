import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, screen, waitFor } from 'storybook/test';
import { Popover, type PopoverProps } from './Popover';
import { Button } from '../../Actions/Button';
import { TextField } from '../../Inputs/TextField';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Open with the trigger to check themes.
const meta = {
  title: 'Overlay/Popover',
  component: Popover,
  args: {
    trigger: <Button variant="tertiary">Adjust</Button>,
    title: 'Weekly target',
    onOpenChange: fn(),
    // Typed as the union so stories may pass a string or an element as well as the function form.
    children: ((close: () => void) => (
      <>
        <TextField label="Applications per week" inputMode="numeric" defaultValue="5" />
        <Button variant="primary" onPress={close}>Done</Button>
      </>
    )) as PopoverProps['children'],
  },
  argTypes: {
    placement: { control: 'select', options: ['bottom start', 'bottom', 'bottom end', 'top start', 'top', 'top end', 'start', 'end'] },
    size: { control: 'radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain, no play — Playwright drives this one (Popover.e2e.ts). */
export const Default: Story = {};

/** Open by default so the docs page and the theme toolbar show the surface without a click. */
export const Open: Story = { args: { defaultOpen: true } };

const InfoIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 7.5v4M8 5v.5" />
  </svg>
);

/** A short explanation with the arrow; the trigger is icon-only, so it carries the name. */
export const Explanation: Story = {
  args: {
    trigger: <Button variant="tertiary" aria-label="What counts as quality?" iconStart={<InfoIcon />} />,
    title: 'What counts as quality',
    showArrow: true,
    placement: 'top',
    children: 'Fit ≥ 70, or an application you marked Stretch on purpose.',
  },
};

/** Combobox-style surface: the page stays reachable and focus leaving closes it. Never for a form. */
export const NonModal: Story = {
  args: {
    trigger: <Button>Filter…</Button>,
    title: undefined,
    'aria-label': 'Filter leads',
    isNonModal: true,
    size: 'md',
    children: <TextField aria-label="Search filters" placeholder="Type to filter" />,
  },
};

export const Placements: Story = {
  render: (args) => (
    <div className="sb-row">
      {(['top start', 'top', 'top end', 'bottom start', 'bottom', 'bottom end', 'start', 'end'] as const).map((placement) => (
        <Popover key={placement} {...args} placement={placement} trigger={<Button>{placement}</Button>} />
      ))}
    </div>
  ),
};

export const LongUkrainianContent: Story = {
  args: {
    trigger: <Button variant="tertiary">Змінити</Button>,
    title: 'Тижнева ціль якісних заявок',
    padding: 'sm',
    children: (close: () => void) => (
      <>
        <TextField label="Заявок на тиждень" inputMode="numeric" defaultValue="5" description="Рахуються лише fit ≥ 70 або свідомий Stretch." />
        <Button variant="primary" onPress={close}>Готово</Button>
      </>
    ),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from Popover.spec.json: Enter opens with focus on the first control; Escape returns focus. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Adjust' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false'); // DialogTrigger emits no aria-haspopup
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Weekly target' }); // portalled to body
    await waitFor(() => expect(within(dialog).getByRole('textbox', { name: 'Applications per week' })).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
