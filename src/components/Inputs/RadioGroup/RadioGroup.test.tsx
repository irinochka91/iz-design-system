import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { RadioGroup, Radio } from '@iz/design-system';

const group = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) => (
  <RadioGroup label="Role type" {...(props as object)}>
    <Radio value="ic">Individual contributor</Radio>
    <Radio value="lead">Lead</Radio>
    <Radio value="manager">Manager</Radio>
  </RadioGroup>
);

describe('RadioGroup', () => {
  it('is a radiogroup named by its label; each radio is named by its own label; clicking the text selects', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(group({ onChange }));
    expect(screen.getByRole('radiogroup', { name: 'Role type' })).toBeInTheDocument();
    const lead = screen.getByRole('radio', { name: 'Lead' });
    expect(screen.queryByRole('radio', { checked: true })).toBeNull();
    await user.click(screen.getByText('Lead'));
    expect(lead).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('lead');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('is one tab stop: Tab lands on the selected radio, arrows move and select with wrap, Space selects, nothing deselects', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(group({ defaultValue: 'lead', onChange }));
    const [ic, lead, manager] = screen.getAllByRole('radio');
    await user.tab();
    expect(lead).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(manager).toHaveFocus();
    expect(manager).toBeChecked();
    await user.keyboard('{ArrowRight}'); // wraps
    expect(ic).toBeChecked();
    await user.keyboard('{ArrowUp}'); // wraps the other way
    expect(manager).toBeChecked();
    await user.keyboard(' ');
    expect(manager).toBeChecked(); // Space on the selected one keeps it
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('skips a disabled option with the arrows and leaves it unclickable', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RadioGroup label="Lead source" defaultValue="board">
        <Radio value="board">Job board</Radio>
        <Radio value="import" isDisabled>Import (coming)</Radio>
        <Radio value="referral">Referral</Radio>
      </RadioGroup>,
    );
    const imp = screen.getByRole('radio', { name: 'Import (coming)' });
    expect(imp).toBeDisabled();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Referral' })).toBeChecked();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('is required and invalid at group level: aria-required, aria-invalid, description then error in aria-describedby', async () => {
    const { container, rerender } = render(group({ isRequired: true, description: 'Pick the closest.', errorMessage: 'Choose a role type' }));
    const g = screen.getByRole('radiogroup', { name: 'Role type' });
    expect(g).toHaveAttribute('aria-required', 'true');
    expect(g).not.toHaveAttribute('aria-invalid');
    expect(g).toHaveAccessibleDescription(/^Pick the closest\.\s*$/); // the empty error element is already listed (ADR-022)
    expect(screen.queryByText('Choose a role type')).toBeNull();
    rerender(group({ isRequired: true, isInvalid: true, description: 'Pick the closest.', errorMessage: 'Choose a role type' }));
    expect(g).toHaveAttribute('aria-invalid', 'true');
    expect(g).toHaveAccessibleDescription('Pick the closest. Choose a role type');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('takes its name from aria-label when there is no visible label', async () => {
    const { container } = render(
      <RadioGroup aria-label="Window" orientation="horizontal" defaultValue="14">
        <Radio value="14">14 days</Radio>
        <Radio value="30">30 days</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Window' })).toHaveAttribute('aria-orientation', 'horizontal');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('read-only is focusable and announced but does not change; disabled leaves the tab order', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container, rerender } = render(group({ isReadOnly: true, defaultValue: 'ic', onChange }));
    const g = screen.getByRole('radiogroup', { name: 'Role type' });
    expect(g).toHaveAttribute('aria-readonly', 'true');
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Individual contributor' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Individual contributor' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
    rerender(group({ isDisabled: true, defaultValue: 'ic' }));
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
    expect(await axe(container)).toHaveNoViolations();
  });
});
