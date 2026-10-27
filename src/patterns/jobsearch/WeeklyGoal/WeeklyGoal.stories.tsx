import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WeeklyGoal, type WeeklyGoalProps } from './WeeklyGoal';
import { Button } from '../../../components/Actions/Button';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all six themes.
const meta = {
  title: 'Patterns/WeeklyGoal',
  component: WeeklyGoal,
  args: { done: 3, target: 5, stretch: { used: 0, quota: 1 }, lastWeek: 5 },
  argTypes: { done: { control: { type: 'range', min: 0, max: 6 } } },
} satisfies Meta<typeof WeeklyGoal>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain, no play — Playwright drives this one (WeeklyGoal.e2e.ts). */
export const Default: Story = {};

/** The app's call on a Saturday with ≥ 2 to go: warning colour AND the next useful step — never a loss. */
export const AtRisk: Story = { args: { done: 3, isAtRisk: true, nextAction: 'Email Priya' } };

/** Met: the end state of the moment, with the streak. */
export const Met: Story = { args: { done: 5, streakWeeks: 7, stretch: { used: 1, quota: 1 } } };

/** A one-off footer from the app: logged, not counted. */
export const Logged: Story = { args: { footer: 'Logged, not counted — fit 58' } };

/** Over target: the figure says 6, the meter clamps to 5. */
export const OverTarget: Story = { args: { done: 6, streakWeeks: 2 } };

/** The moment itself: press Done until the fifth bar springs, the digit rolls and the footer crossfades. */
export const Moment: Story = {
  render: (args) => <MomentDemo {...args} />,
};
function MomentDemo(args: WeeklyGoalProps) {
  const [done, setDone] = useState(4);
  return (
    <div className="sb-row">
      <WeeklyGoal {...args} done={done} streakWeeks={7} lastWeek={5} />
      <Button onPress={() => setDone((d) => d + 1)}>Mark one done</Button>
      <Button variant="tertiary" onPress={() => setDone(4)}>
        Reset
      </Button>
    </div>
  );
}
