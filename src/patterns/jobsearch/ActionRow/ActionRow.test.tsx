import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ActionRow, type Action } from '@iz/design-system';

const email: Action = { id: 'a1', title: 'Email Priya', company: 'Orbit', stage: 'Interview', time: '10:00', dueLabel: 'Today' };
const row = (props: Partial<React.ComponentProps<typeof ActionRow>> = {}) => (
  <main>
    <ul>
      <ActionRow action={email} group="today" onDone={vi.fn()} onSnooze={vi.fn()} onOpen={vi.fn()} {...props} />
    </ul>
  </main>
);

describe('ActionRow', () => {
  it('is a listitem with four buttons named for the action, in reading order; axe clean', async () => {
    const { container } = render(row());
    const item = screen.getByRole('listitem');
    expect(within(item).getAllByRole('button').map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      'Mark done: Email Priya',
      'Snooze',
      'Snooze options: Email Priya',
      'Open: Email Priya',
    ]);
    expect(screen.getByRole('group', { name: 'Snooze: Email Priya' })).toBeInTheDocument();
    expect(item).toHaveTextContent('Email Priya');
    expect(item).toHaveTextContent('Orbit');
    expect(item).toHaveTextContent('Interview');
    expect(item).toHaveTextContent('Today');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('the ring is a one-way Button: onDone fires with the action; done is exposed as aria-pressed and the row goes inert', async () => {
    const onDone = vi.fn();
    const user = userEvent.setup();
    const { container, rerender } = render(row({ onDone }));
    const ring = screen.getByRole('button', { name: 'Mark done: Email Priya' });
    expect(ring).toHaveAttribute('aria-pressed', 'false');
    await user.click(ring);
    expect(onDone).toHaveBeenCalledWith(email);
    expect(ring).toHaveAttribute('aria-pressed', 'false'); // the row does not flip itself; the app does
    rerender(row({ onDone, isDone: true }));
    expect(screen.getByRole('listitem')).toHaveAttribute('data-done');
    const inner = screen.getByRole('listitem').firstElementChild!;
    expect(inner).toHaveAttribute('aria-hidden', 'true');
    expect(inner).toHaveAttribute('inert');
    expect(await axe(container)).toHaveNoViolations();
    rerender(row({ onDone })); // Undo: the same row, restored in place
    expect(screen.getByRole('button', { name: 'Mark done: Email Priya' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('listitem').firstElementChild).not.toHaveAttribute('inert');
  });

  it('Snooze applies +3d; the options menu offers the four presets and reports the chosen one', async () => {
    const onSnooze = vi.fn();
    const user = userEvent.setup();
    render(row({ onSnooze }));
    await user.click(screen.getByRole('button', { name: 'Snooze' }));
    expect(onSnooze).toHaveBeenLastCalledWith('+3d', email);
    await user.click(screen.getByRole('button', { name: 'Snooze options: Email Priya' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['Tomorrow', 'In 3 days', 'Monday', 'Pick a date…']);
    await user.click(within(menu).getByRole('menuitem', { name: 'Monday' }));
    expect(onSnooze).toHaveBeenLastCalledWith('monday', email);
  });

  it('Open fires onOpen; overdue marks the group on the row and keeps the words in the due label', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    const overdue: Action = { ...email, id: 'a2', dueLabel: '2 days ago' };
    const { container } = render(row({ action: overdue, group: 'overdue', onOpen }));
    await user.click(screen.getByRole('button', { name: 'Open: Email Priya' }));
    expect(onOpen).toHaveBeenCalledWith(overdue);
    expect(screen.getByRole('listitem')).toHaveAttribute('data-group', 'overdue');
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('never listens for letter shortcuts itself (they are the list\'s)', async () => {
    const onDone = vi.fn();
    const onSnooze = vi.fn();
    const user = userEvent.setup();
    render(row({ onDone, onSnooze }));
    await user.tab();
    await user.keyboard('ds');
    expect(onDone).not.toHaveBeenCalled();
    expect(onSnooze).not.toHaveBeenCalled();
  });
});
