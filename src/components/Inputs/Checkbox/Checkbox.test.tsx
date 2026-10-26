import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Checkbox } from '@iz/design-system';

describe('Checkbox', () => {
  it('takes its name from the visible label, and clicking the text toggles it', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Checkbox onChange={onChange}>Open to remote roles</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'Open to remote roles' });
    expect(box).not.toBeChecked();
    await user.click(screen.getByText('Open to remote roles'));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('takes its name from aria-label when there is no visible label', async () => {
    const { container } = render(<Checkbox aria-label="Select Orbit — Senior Product Designer" />);
    expect(screen.getByRole('checkbox', { name: 'Select Orbit — Senior Product Designer' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Space toggles, Enter does not', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox onChange={onChange}>Remote</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'Remote' });
    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard(' ');
    expect(box).toBeChecked();
    await user.keyboard('{Enter}');
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('indeterminate exposes aria-checked="mixed" and selects (not clears) on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox isIndeterminate onChange={onChange}>Select all</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'Select all' });
    // React Aria sets the native `indeterminate` property; browsers report it as aria-checked="mixed".
    expect(box).toBePartiallyChecked();
    await user.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('links description and error through aria-describedby; the error element exists before it is shown', async () => {
    const { rerender, container } = render(
      <Checkbox description="We store the lead only." errorMessage="Tick to continue">Agree</Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: 'Agree' });
    expect(box).toHaveAccessibleDescription(/^We store the lead only\.\s*$/);
    expect(box).not.toHaveAttribute('aria-invalid');
    rerender(<Checkbox description="We store the lead only." errorMessage="Tick to continue" isInvalid>Agree</Checkbox>);
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(/^We store the lead only\.\s+Tick to continue$/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes required semantically, without the native attribute', () => {
    render(<Checkbox isRequired>Agree</Checkbox>);
    const box = screen.getByRole('checkbox', { name: /Agree/ });
    expect(box).toHaveAttribute('aria-required', 'true');
    expect(box).not.toHaveAttribute('required');
  });

  it('read-only stays focusable and announced, but does not toggle', async () => {
    const user = userEvent.setup();
    render(<Checkbox isReadOnly defaultSelected>Locked</Checkbox>);
    const box = screen.getByRole('checkbox', { name: 'Locked' });
    expect(box).toHaveAttribute('aria-readonly', 'true');
    expect(box).toBeChecked();
    await user.tab();
    expect(box).toHaveFocus();
    await user.keyboard(' ');
    expect(box).toBeChecked(); // unchanged
  });

  it('disabled is out of the tab order', async () => {
    const user = userEvent.setup();
    render(<Checkbox isDisabled>Off</Checkbox>);
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Off' })).not.toHaveFocus();
  });

  it('forwards className last so consumers can add layout classes', () => {
    const { container } = render(<Checkbox className="my-layout">X</Checkbox>);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/my-layout$/);
  });
});
