import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button, Popover, TextField } from '@iz/design-system';

// A <main> landmark: axe's "content must be in a landmark" rule otherwise flags the bare fixture itself.
const adjust = (props: Partial<React.ComponentProps<typeof Popover>> = {}) => (
  <main>
    <button type="button">Outside</button>
    <Popover trigger={<Button>Adjust</Button>} title="Weekly target" {...(props as object)}>
      {(close: () => void) => (
        <>
          <TextField label="Applications per week" defaultValue="5" />
          <Button variant="primary" onPress={close}>Done</Button>
        </>
      )}
    </Popover>
  </main>
);

describe('Popover', () => {
  it('opens as a dialog named by its title with focus on the first control; the page behind is hidden from AT', async () => {
    const user = userEvent.setup();
    const { container } = render(adjust());
    const trigger = screen.getByRole('button', { name: 'Adjust' });
    // React Aria's DialogTrigger wires aria-expanded + aria-controls; it does not emit aria-haspopup.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(await axe(container)).toHaveNoViolations();
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Weekly target' });
    expect(within(dialog).getByRole('heading', { level: 3, name: 'Weekly target' })).toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByRole('textbox', { name: 'Applications per week' })).toHaveFocus());
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Outside' })).toBeNull()); // aria-hidden outside
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('Escape closes and returns focus to the trigger; close() from inside closes too', async () => {
    const user = userEvent.setup();
    render(adjust());
    const trigger = screen.getByRole('button', { name: 'Adjust' });
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.click(trigger);
    const again = await screen.findByRole('dialog');
    expect(again).not.toBe(dialog);
    await user.click(within(again).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('a click outside closes the modal popover', async () => {
    const user = userEvent.setup();
    render(adjust());
    await user.click(screen.getByRole('button', { name: 'Adjust' }));
    await screen.findByRole('dialog');
    await user.click(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('isNonModal keeps the page reachable and is named by aria-label when there is no title', async () => {
    const user = userEvent.setup();
    render(
      <main>
        <button type="button">Outside</button>
        <Popover trigger={<Button>Filter…</Button>} aria-label="Filter leads" isNonModal>
          <TextField aria-label="Search filters" />
        </Popover>
      </main>,
    );
    await user.click(screen.getByRole('button', { name: 'Filter…' }));
    const dialog = await screen.findByRole('dialog', { name: 'Filter leads' });
    expect(within(dialog).queryByRole('heading')).toBeNull();
    expect(screen.getByRole('button', { name: 'Outside' })).toBeInTheDocument(); // not hidden
    // React Aria portals the popover to the end of <body>, outside any landmark. In modal mode axe
    // never sees that (everything outside is aria-hidden); in non-modal mode its best-practice
    // "region" rule flags the portal container. That is the library's rendering, not a defect here.
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
