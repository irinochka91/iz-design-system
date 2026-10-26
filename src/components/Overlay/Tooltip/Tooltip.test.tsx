import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button, Tooltip } from '@iz/design-system';

const hint = (props: Partial<React.ComponentProps<typeof Tooltip>> = {}) => (
  <main>
    <Tooltip trigger={<Button aria-label="Open application">↗</Button>} delay={0} closeDelay={0} {...(props as object)}>
      Open application
    </Tooltip>
  </main>
);

/**
 * React Aria only treats hover as hover when the current interaction modality is 'pointer', which a real
 * browser sets with the pointermove that precedes pointerenter. user-event in jsdom fires pointerenter
 * first, so prime the modality the way a moving mouse would.
 */
const moveMouse = () => fireEvent.pointerMove(document.body);

describe('Tooltip', () => {
  it('keyboard focus shows it as the trigger\'s description; Escape hides it and focus stays', async () => {
    const user = userEvent.setup();
    const { container } = render(hint());
    const trigger = screen.getByRole('button', { name: 'Open application' });
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
    await user.tab();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Open application');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    expect(trigger).toHaveAccessibleDescription('Open application');
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations(); // portalled, outside landmarks
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(trigger).toHaveFocus();
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('hover shows it and it stays while the pointer is over the tooltip itself (1.4.13 hoverable)', async () => {
    const user = userEvent.setup();
    render(hint({ closeDelay: 100 })); // the grace period is what makes the tooltip reachable; 0 would defeat the test
    const trigger = screen.getByRole('button', { name: 'Open application' });
    moveMouse();
    await user.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    await user.unhover(trigger);
    await user.hover(tooltip);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.unhover(tooltip);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('showOn="focus" ignores hover but still shows on keyboard focus', async () => {
    const user = userEvent.setup();
    render(hint({ showOn: 'focus' }));
    const trigger = screen.getByRole('button', { name: 'Open application' });
    moveMouse();
    await user.hover(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.unhover(trigger);
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });

  it('isDisabled suppresses the tooltip without disabling the trigger', async () => {
    const user = userEvent.setup();
    render(hint({ isDisabled: true }));
    const trigger = screen.getByRole('button', { name: 'Open application' });
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).not.toBeDisabled();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
