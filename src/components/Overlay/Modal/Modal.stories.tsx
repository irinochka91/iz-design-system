import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, screen, waitFor } from 'storybook/test';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from '../../Actions/Button';
import { TextField } from '../../Inputs/TextField';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Open the dialog with the trigger to check themes.
const meta = {
  title: 'Overlay/Modal',
  component: Modal,
  args: {
    trigger: <Button>Withdraw…</Button>,
    title: 'Withdraw this application?',
    onOpenChange: fn(),
    children: (close: () => void) => (
      <>
        <ModalBody>Orbit will not be notified. The stage becomes Withdrawn and the actions are archived.</ModalBody>
        <ModalFooter>
          <Button onPress={close}>Cancel</Button>
          <Button variant="danger" onPress={close}>Withdraw application</Button>
        </ModalFooter>
      </>
    ),
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    role: { control: 'radio', options: ['dialog', 'alertdialog'] },
  },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain dialog with a trigger and no play — Playwright drives this one (Modal.e2e.ts). */
export const Default: Story = {};

/** A destructive confirmation: alertdialog, the question in the title, no backdrop dismiss. */
export const Confirm: Story = { args: { role: 'alertdialog', isDismissable: false, size: 'sm' } };

/** Open by default so the docs page and the theme toolbar show the panel without a click. */
export const Open: Story = { args: { defaultOpen: true, size: 'sm' } };

export const PickDate: Story = {
  args: {
    trigger: <Button>Pick a date…</Button>,
    title: 'Snooze until',
    children: (close: () => void) => (
      <>
        <ModalBody>
          <TextField label="Date" type="text" placeholder="e.g. next Monday" />
        </ModalBody>
        <ModalFooter>
          <Button onPress={close}>Cancel</Button>
          <Button variant="primary" onPress={close}>Snooze</Button>
        </ModalFooter>
      </>
    ),
  },
};

/** The ⌘K palette shape: no heading, named by aria-label, opened programmatically. */
const PaletteDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Open palette (⌘K)</Button>
      <Modal isOpen={open} onOpenChange={setOpen} aria-label="Search and commands" size="md" padding="md">
        <ModalBody>
          <TextField aria-label="Search" placeholder="Type a command or search…" isFullWidth />
        </ModalBody>
      </Modal>
    </>
  );
};
export const Palette: Story = { render: () => <PaletteDemo /> };

export const Large: Story = { args: { size: 'lg', title: 'New experiment' } };

export const LongUkrainianContent: Story = {
  args: {
    trigger: <Button>Відкликати…</Button>,
    title: 'Відкликати цю заявку до Orbit на позицію старшого продуктового дизайнера?',
    size: 'sm',
    padding: 'md',
    children: (close: () => void) => (
      <>
        <ModalBody>Компанію не повідомлять. Стадія стане «Відкликано», а дії буде заархівовано — це можна скасувати лише вручну.</ModalBody>
        <ModalFooter>
          <Button onPress={close}>Скасувати</Button>
          <Button variant="danger" onPress={close}>Відкликати заявку</Button>
        </ModalFooter>
      </>
    ),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from Modal.spec.json: Enter opens with focus inside; Tab is trapped; Escape returns focus. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Withdraw…' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Withdraw this application?' }); // portalled to body
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    const withdraw = within(dialog).getByRole('button', { name: 'Withdraw application' });
    await waitFor(() => expect(cancel).toHaveFocus()); // first focusable
    await userEvent.tab();
    await expect(withdraw).toHaveFocus();
    await userEvent.tab(); // trapped: wraps to the first control
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
