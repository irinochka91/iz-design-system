import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button, Modal, ModalBody, ModalFooter } from '@iz/design-system';

const confirm = (props: Partial<React.ComponentProps<typeof Modal>> = {}) => (
  <>
    <button type="button">Outside</button>
    <Modal trigger={<Button>Withdraw…</Button>} title="Withdraw this application?" {...(props as object)}>
      {(close: () => void) => (
        <>
          <ModalBody>Orbit will not be notified.</ModalBody>
          <ModalFooter>
            <Button onPress={close}>Cancel</Button>
            <Button variant="danger" onPress={close}>Withdraw application</Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  </>
);

describe('Modal', () => {
  it('opens as a named modal dialog with focus on the first control; the page behind is hidden from AT', async () => {
    const user = userEvent.setup();
    const { container } = render(confirm());
    const trigger = screen.getByRole('button', { name: 'Withdraw…' });
    expect(await axe(container)).toHaveNoViolations();
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Withdraw this application?' });
    expect(within(dialog).getByRole('heading', { level: 2, name: 'Withdraw this application?' })).toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus());
    // Modality: React Aria omits aria-modal (inconsistent AT support) and instead hides everything
    // outside the dialog with aria-hidden — so the outside button leaves the accessibility tree.
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Outside' })).toBeNull());
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('traps Tab inside and returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup();
    render(confirm());
    const trigger = screen.getByRole('button', { name: 'Withdraw…' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    const withdraw = within(dialog).getByRole('button', { name: 'Withdraw application' });
    await waitFor(() => expect(cancel).toHaveFocus());
    await user.tab();
    expect(withdraw).toHaveFocus();
    await user.tab();
    await waitFor(() => expect(cancel).toHaveFocus()); // wrapped
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('close() from the footer closes; the backdrop closes only when dismissable', async () => {
    const user = userEvent.setup();
    const { rerender } = render(confirm({ isDismissable: false, role: 'alertdialog' }));
    await user.click(screen.getByRole('button', { name: 'Withdraw…' }));
    const alert = await screen.findByRole('alertdialog');
    expect(alert).toBeInTheDocument();
    await user.click(document.body); // backdrop / outside — must NOT close
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.click(within(alert).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());

    rerender(confirm({ isDismissable: true }));
    await user.click(screen.getByRole('button', { name: 'Withdraw…' }));
    await screen.findByRole('dialog');
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('a dialog without a title is named by aria-label and can be opened programmatically', async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal isOpen onOpenChange={onOpenChange} aria-label="Search and commands">
        <ModalBody>
          <input aria-label="Search" />
        </ModalBody>
      </Modal>,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Search and commands' });
    expect(within(dialog).queryByRole('heading')).toBeNull();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
