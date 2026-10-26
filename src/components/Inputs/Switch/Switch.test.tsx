import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Switch } from '@iz/design-system';

describe('Switch', () => {
  it('is a switch named by its visible label; clicking the text toggles and applies at once', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Switch onChange={onChange}>Focus timer</Switch>);
    const input = screen.getByRole('switch', { name: 'Focus timer' });
    expect(input).not.toBeChecked();
    await user.click(screen.getByText('Focus timer'));
    expect(input).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('takes its name from aria-label when there is no visible label', async () => {
    const { container } = render(<Switch aria-label="Reminders for overdue actions" />);
    expect(screen.getByRole('switch', { name: 'Reminders for overdue actions' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Space toggles, Enter does not', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch onChange={onChange}>Focus timer</Switch>);
    const input = screen.getByRole('switch', { name: 'Focus timer' });
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard(' ');
    expect(input).toBeChecked();
    await user.keyboard('{Enter}');
    expect(input).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('links the description with aria-describedby and keeps it out of the name', async () => {
    const { container } = render(<Switch description="25 minutes, then a short break.">Focus timer</Switch>);
    const input = screen.getByRole('switch', { name: 'Focus timer' });
    expect(input).toHaveAccessibleDescription('25 minutes, then a short break.');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('labelPlacement="start" changes layout only — same DOM order, same name', async () => {
    const { container } = render(<Switch labelPlacement="start">Follow system theme</Switch>);
    const input = screen.getByRole('switch', { name: 'Follow system theme' });
    const label = screen.getByText('Follow system theme');
    expect(input.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('read-only is focusable and announced but does not toggle; disabled leaves the tab order', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container, rerender } = render(<Switch isReadOnly defaultSelected onChange={onChange}>Weekly summary email</Switch>);
    const input = screen.getByRole('switch', { name: 'Weekly summary email' });
    expect(input).toHaveAttribute('aria-readonly', 'true');
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard(' ');
    expect(input).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
    rerender(<Switch isDisabled defaultSelected>Weekly summary email</Switch>);
    expect(screen.getByRole('switch', { name: 'Weekly summary email' })).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });
});
