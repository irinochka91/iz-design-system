import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Chip } from './Chip';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all six themes.
const meta = {
  title: 'Display/Chip',
  component: Chip,
  args: { children: 'Orbit' },
  argTypes: {
    variant: { control: 'radio', options: ['property', 'stage', 'filter'] },
    emphasis: { control: 'radio', options: ['quiet', 'tint', 'strong'] },
  },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Property: Story = {};

/** The three emphases on static stage chips — the StageChip pattern maps stage → emphasis. */
export const Emphasis: Story = {
  render: () => (
    <div className="sb-row">
      <Chip variant="stage">Applied</Chip>
      <Chip variant="stage" emphasis="tint">Interview</Chip>
      <Chip variant="stage" emphasis="strong">Offer</Chip>
    </div>
  ),
};

export const Filter: Story = { args: { variant: 'filter', children: 'Matches my priorities', onChange: fn() } };
export const FilterSelected: Story = { args: { variant: 'filter', children: 'Matches my priorities', defaultSelected: true } };
export const FilterDisabled: Story = { args: { variant: 'filter', children: 'Remote only', isDisabled: true } };

/** A cycling stage: a <button> whose aria-label says what pressing does. The pattern swaps the label and toasts Undo. */
export const StageCycling: Story = {
  args: { variant: 'stage', children: 'Screen', 'aria-label': 'Stage: Screen. Press to advance', onPress: fn() },
};

const Tick = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
  </svg>
);
const Dash = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 8h8" />
  </svg>
);

/** Priority chips: the glyph is decorative; "met" / "not met" is in (visually hidden) text, so the name carries the state. */
export const Priorities: Story = {
  render: () => (
    <div className="sb-row">
      <Chip emphasis="tint" iconStart={<Tick />}>
        Hybrid<span className="iz-visually-hidden">, met</span>
      </Chip>
      <Chip iconStart={<Dash />}>
        Salary floor<span className="iz-visually-hidden">, not met</span>
      </Chip>
    </div>
  ),
};

export const LongUkrainianLabel: Story = {
  args: { variant: 'filter', children: 'Відповідає моїм пріоритетам', onChange: fn() },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** A static chip before a filter: Tab must skip the first. No play — Playwright drives this one (Chip.e2e.ts). */
export const StaticThenFilter: Story = {
  render: () => (
    <div className="sb-row">
      <Chip>Static first</Chip>
      <Chip variant="filter">Toggle me</Chip>
    </div>
  ),
};

// `args.onChange` cannot be typed on the ChipProps union (it exists only on the filter branch),
// so the Keyboard story holds its own spy.
const onToggle = fn();

/** Keyboard contract from Chip.spec.json: Tab reaches only interactive chips; Space/Enter toggle a filter. */
export const Keyboard: Story = {
  render: () => (
    <div className="sb-row">
      <Chip>Static first</Chip>
      <Chip variant="filter" onChange={onToggle}>Toggle me</Chip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Toggle me' });
    await userEvent.tab(); // skips the static chip
    await expect(toggle).toHaveFocus();
    await expect(toggle).toHaveAttribute('data-focus-visible');
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(onToggle).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Enter}');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  },
};
