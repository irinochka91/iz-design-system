import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Toast } from './Toast';
import { Button } from '../../Actions/Button';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar — dark themes drop the shadow.
const meta = {
  title: 'Feedback/Toast',
  component: Toast,
  args: { isOpen: true, onClose: fn(), children: 'Done: Email Priya', timeout: 0 },
} satisfies Meta<typeof Toast>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Static (timeout 0) so the docs page keeps it on screen. */
export const Default: Story = {};
export const WithAction: Story = { args: { action: { label: 'Undo', onPress: fn() } } };
export const LongUkrainianMessage: Story = {
  args: { children: 'Готово: написати Прії з Orbit щодо наступного кроку після співбесіди', action: { label: 'Скасувати', onPress: fn() } },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** The real thing: a button opens the toast (6 s), Undo closes it; a second press replaces the message. */
const PlaygroundDemo = () => {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <div className="sb-row">
      <Button
        variant="primary"
        onPress={() => {
          setCount((c) => c + 1);
          setOpen(true);
        }}
      >
        Mark done
      </Button>
      <Toast isOpen={open} onClose={() => setOpen(false)} announceKey={count} action={{ label: 'Undo', onPress: () => undefined }}>
        Done: Email Priya ({count})
      </Toast>
    </div>
  );
};
export const Playground: Story = { render: () => <PlaygroundDemo /> };

/** Keyboard contract from Toast.spec.json: Tab reaches Undo then Dismiss; Escape inside dismisses. */
export const Keyboard: Story = {
  args: { action: { label: 'Undo', onPress: fn() } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const undo = canvas.getByRole('button', { name: 'Undo' });
    await userEvent.tab();
    await expect(undo).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Dismiss' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(args.onClose).toHaveBeenLastCalledWith('dismiss');
  },
};
