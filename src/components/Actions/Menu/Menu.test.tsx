import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button, Menu, MenuItem, MenuSection, MenuHeader, MenuSeparator } from '@iz/design-system';

const snooze = (onAction = vi.fn()) => (
  <Menu trigger={<Button>Snooze</Button>} onAction={onAction}>
    <MenuItem id="tomorrow">Tomorrow</MenuItem>
    <MenuItem id="+3d">In 3 days</MenuItem>
    <MenuItem id="mon">Monday</MenuItem>
    <MenuSeparator />
    <MenuItem id="pick">Pick a date…</MenuItem>
  </Menu>
);

describe('Menu', () => {
  it('the trigger announces a menu popup; Enter opens it on the first item; axe is clean open and closed', async () => {
    const user = userEvent.setup();
    const { container } = render(snooze());
    const trigger = screen.getByRole('button', { name: 'Snooze' });
    // React Aria emits the boolean form; per ARIA, aria-haspopup="true" means a menu.
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(await axe(container)).toHaveNoViolations();

    await user.tab();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveAccessibleName('Snooze'); // labelled by its trigger
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveFocus();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('arrows move and wrap, Home/End jump, type-ahead finds by label', async () => {
    const user = userEvent.setup();
    render(snooze());
    await user.tab();
    await user.keyboard('{ArrowUp}'); // opens on the LAST item
    const items = await screen.findAllByRole('menuitem');
    expect(items[3]).toHaveFocus();
    await user.keyboard('{ArrowDown}'); // wraps to first
    expect(items[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(items[3]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(items[0]).toHaveFocus();
    await user.keyboard('m'); // type-ahead
    expect(screen.getByRole('menuitem', { name: 'Monday' })).toHaveFocus();
  });

  it('choosing fires onAction with the id, closes, and returns focus to the trigger', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(snooze(onAction));
    const trigger = screen.getByRole('button', { name: 'Snooze' });
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await user.keyboard('{ArrowDown}{Enter}'); // second item
    // React Aria calls onAction(key, …) with a second argument; the key is what matters.
    expect(onAction.mock.lastCall?.[0]).toBe('+3d');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    // focus is restored after the popover unmounts — asynchronous, hence waitFor
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Escape closes without a choice and returns focus to the trigger', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(snooze(onAction));
    const trigger = screen.getByRole('button', { name: 'Snooze' });
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onAction).not.toHaveBeenCalled();
    // Tab-out (no focus trap) is asserted in Menu.e2e.ts: jsdom has no real focus-out for a portalled
    // popover, so a unit test here would pass or fail for the wrong reasons.
  });

  it('disabled items are announced as such; single selection exposes menuitemradio + aria-checked', async () => {
    const user = userEvent.setup();
    render(
      <Menu trigger={<Button>Stage</Button>} selectionMode="single" selectedKey="screen" disabledKeys={['offer']}>
        <MenuSection>
          <MenuHeader>Pipeline</MenuHeader>
          <MenuItem id="applied">Applied</MenuItem>
          <MenuItem id="screen">Screen</MenuItem>
          <MenuItem id="offer">Offer</MenuItem>
        </MenuSection>
      </Menu>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    await screen.findByRole('menu');
    const screenItem = screen.getByRole('menuitemradio', { name: 'Screen' });
    expect(screenItem).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Applied' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('menuitemradio', { name: 'Offer' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('group', { name: 'Pipeline' })).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
