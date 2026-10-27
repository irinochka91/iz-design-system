import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ActionRow, type Action, type ActionRowProps } from './ActionRow';
import { Toast } from '../../../components/Feedback/Toast';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Rows always sit in a <ul>, as in Today.
const email: Action = { id: 'a1', title: 'Email Priya', company: 'Orbit', stage: 'Interview', time: '10:00', dueLabel: 'Today' };
const followUp: Action = { id: 'a2', title: 'Follow up with Lumen Health', company: 'Lumen Health', stage: 'Applied', dueLabel: '2 days ago' };
const prep: Action = { id: 'a3', title: 'Prepare portfolio walkthrough', company: 'Kite Labs', stage: 'Screen', time: 'Thu 14:00', dueLabel: 'Thu' };

const meta = {
  title: 'Patterns/ActionRow',
  component: ActionRow,
  args: { action: email, group: 'today', onDone: fn(), onSnooze: fn(), onOpen: fn() },
  argTypes: { group: { control: 'radio', options: ['overdue', 'today', 'week'] } },
  // Rows sit in the decorator's <ul>; a story that renders its own list (and a toast beside it) opts out.
  decorators: [(Story, ctx) => (ctx.parameters['ownList'] ? Story() : <ul className="sb-list">{Story()}</ul>)],
} satisfies Meta<typeof ActionRow>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain, no play — Playwright drives this one (ActionRow.e2e.ts). */
export const Default: Story = {};

/** Only the due label and the ring go danger; title, chips and buttons stay neutral (backlog #2). */
export const Overdue: Story = { args: { action: followUp, group: 'overdue' } };
export const ThisWeek: Story = { args: { action: prep, group: 'week' } };

/** The done end state: ring filled, tick drawn, title struck, row collapsed and inert. */
export const Done: Story = { args: { isDone: true } };

export const Phone: Story = {
  args: { action: followUp, group: 'overdue' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** The list's side of the contract: done applied at once, one Undo toast, Undo restores the row in place. */
export const WithUndo: Story = {
  parameters: { ownList: true },
  render: (args) => <UndoDemo {...args} />,
};
function UndoDemo(args: ActionRowProps) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ action: Action; key: number } | null>(null);
  const markDone = (a: Action) => {
    setDone((s) => new Set(s).add(a.id));
    setToast({ action: a, key: Date.now() });
  };
  const undo = (a: Action) => setDone((s) => { const n = new Set(s); n.delete(a.id); return n; });
  return (
    <>
      <ul className="sb-list">
        {[email, followUp, prep].map((a) => (
          <ActionRow key={a.id} {...args} action={a} group={a.id === 'a2' ? 'overdue' : 'today'} isDone={done.has(a.id)} onDone={markDone} />
        ))}
      </ul>
      {toast && (
        <Toast isOpen onClose={() => setToast(null)} announceKey={toast.key} action={{ label: 'Undo', onPress: () => undo(toast.action) }}>
          Done: {toast.action.title}
        </Toast>
      )}
    </>
  );
}

/** Keyboard contract from ActionRow.spec.json: four real buttons in reading order; Snooze applies +3d; the ring is one-way. */
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Mark done: Email Priya' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Snooze' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onSnooze).toHaveBeenLastCalledWith('+3d', email);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Snooze options: Email Priya' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Open: Email Priya' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onOpen).toHaveBeenLastCalledWith(email);
  },
};
