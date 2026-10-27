import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { StageChip, STAGES, type Stage, type StageChipProps } from './StageChip';
import { Toast } from '../../../components/Feedback/Toast';

// Every story is an axe test (preview.ts: a11y.test = 'error').
const meta = {
  title: 'Patterns/StageChip',
  component: StageChip,
  args: { stage: 'Screen', onChange: fn() },
  argTypes: { stage: { control: 'radio', options: [...STAGES, 'Rejected', 'Withdrawn'] } },
} satisfies Meta<typeof StageChip>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain, no play — Playwright drives this one (StageChip.e2e.ts). Cycling: press or Shift+→ advances, Shift+← reverts. */
export const Default: Story = {};

/** One mapping everywhere: every stage quiet, Interview tint, Offer the one strong. */
export const AllStages: Story = {
  render: () => (
    <div className="sb-row">
      {STAGES.map((s) => (
        <StageChip key={s} stage={s} />
      ))}
    </div>
  ),
};

/** Terminal states: neutral, static, never red, never in the cycle. */
export const Terminal: Story = {
  render: (args) => (
    <div className="sb-row">
      <StageChip {...args} stage="Rejected" />
      <StageChip {...args} stage="Withdrawn" />
    </div>
  ),
};

export const Final: Story = { args: { stage: 'Offer' } };
export const Disabled: Story = { args: { isDisabled: true } };

/** The app's side: apply at once, show the one Undo toast, Undo passes the previous stage back. */
export const WithUndo: Story = {
  render: (args) => <UndoDemo {...args} />,
};
function UndoDemo(args: StageChipProps) {
  const [stage, setStage] = useState<Stage>('Screen');
  const [toast, setToast] = useState<{ prev: Stage; next: Stage; key: number } | null>(null);
  return (
    <>
      <StageChip
        {...args}
        stage={stage}
        onChange={(next, prev) => {
          setStage(next);
          setToast({ prev, next, key: Date.now() });
        }}
      />
      {toast && (
        <Toast
          isOpen
          onClose={() => setToast(null)}
          announceKey={toast.key}
          action={{ label: 'Undo', onPress: () => setStage(toast.prev) }}
        >
          Stage: {toast.next}
        </Toast>
      )}
    </>
  );
}

/** Keyboard contract from StageChip.spec.json: Enter advances, Shift+→ advances, Shift+← reverts, plain arrows do nothing. */
export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Stage: Screen. Press to advance' });
    await userEvent.tab();
    await expect(chip).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith('Interview', 'Screen');
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    await expect(args.onChange).toHaveBeenLastCalledWith('Interview', 'Screen');
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    await expect(args.onChange).toHaveBeenLastCalledWith('Applied', 'Screen');
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onChange).toHaveBeenCalledTimes(3);
  },
};
