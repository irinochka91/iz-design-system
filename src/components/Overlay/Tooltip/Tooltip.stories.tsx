import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, screen, waitFor } from 'storybook/test';
import { Tooltip } from './Tooltip';
import { Button } from '../../Actions/Button';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Focus a trigger with Tab to see the tooltip.
const OpenIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" />
  </svg>
);

const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  args: {
    trigger: <Button aria-label="Open application" iconStart={<OpenIcon />} />,
    children: 'Open application',
    onOpenChange: fn(),
  },
  argTypes: {
    placement: { control: 'radio', options: ['top', 'bottom', 'start', 'end'] },
    showOn: { control: 'radio', options: ['hover', 'focus'] },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain, no play — Playwright drives this one (Tooltip.e2e.ts). delay 0 so a hover test need not wait. */
export const Default: Story = { args: { delay: 0 } };

/** Shown for the docs page and the theme toolbar. */
export const Open: Story = { args: { isOpen: true } };

export const ShortcutHint: Story = {
  args: { trigger: <Button>Mark done</Button>, children: 'Mark done (D)', placement: 'bottom', delay: 0 },
};

/** Keyboard focus only — hover would be noise on a text button. */
export const FocusOnly: Story = {
  args: { trigger: <Button variant="tertiary">Stretch</Button>, children: 'Counts against the 1-in-5 stretch quota', showOn: 'focus' },
};

export const Placements: Story = {
  render: (args) => (
    <div className="sb-row">
      {(['top', 'bottom', 'start', 'end'] as const).map((placement) => (
        <Tooltip key={placement} {...args} placement={placement} trigger={<Button>{placement}</Button>} isOpen>
          {`Placed ${placement}`}
        </Tooltip>
      ))}
    </div>
  ),
};

export const LongUkrainianHint: Story = {
  args: {
    trigger: <Button aria-label="Відкрити заявку" iconStart={<OpenIcon />} />,
    children: 'Відкрити картку заявки з усіма наступними кроками та підготовкою до співбесіди',
    isOpen: true,
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from Tooltip.spec.json: focus shows it with aria-describedby; Escape hides it, focus stays. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open application' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    const tooltip = await screen.findByRole('tooltip'); // portalled to body
    await expect(tooltip).toHaveTextContent('Open application');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-describedby', tooltip.id));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};
