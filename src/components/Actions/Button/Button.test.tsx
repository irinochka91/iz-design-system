import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '@iz/design-system';

describe('Button', () => {
  it('has an accessible name from its children and no axe violations', async () => {
    const { container } = render(<Button variant="primary">Save changes</Button>);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('icon-only button takes its name from aria-label and hides the icon from AT', async () => {
    const { container } = render(
      <Button aria-label="Close" iconStart={<svg data-testid="icon" />} />,
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('fires onPress for Enter and Space, not when disabled', async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<Button onPress={onPress}>Go</Button>);
    const button = screen.getByRole('button', { name: 'Go' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onPress).toHaveBeenCalledTimes(2);

    rerender(<Button onPress={onPress} isDisabled>Go</Button>);
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it('pending state is aria-disabled, keeps the name and focusability, and suppresses presses', async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<Button onPress={onPress} isPending>Saving</Button>);
    const button = screen.getByRole('button', { name: /Saving/ });
    // React Aria exposes pending as aria-disabled + data-pending (not aria-busy) and keeps the button focusable.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-pending');
    expect(button).not.toBeDisabled();
    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards className last so consumers can add layout classes', () => {
    render(<Button className="my-layout">X</Button>);
    expect(screen.getByRole('button').className).toMatch(/my-layout$/);
  });
});
