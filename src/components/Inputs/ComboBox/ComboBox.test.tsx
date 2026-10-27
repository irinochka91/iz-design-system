import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ComboBox, ComboBoxItem } from '@iz/design-system';

// The list portals to body, outside <main>; axe's region rule is about page landmarks, not the component.
const axeOpen = () => axe(document.body, { rules: { region: { enabled: false } } });

const field = (props: Partial<React.ComponentProps<typeof ComboBox>> = {}) => (
  <main>
    <ComboBox label="Company" {...(props as object)}>
      <ComboBoxItem id="orbit">Orbit</ComboBoxItem>
      <ComboBoxItem id="lumen">Lumen Health</ComboBoxItem>
      <ComboBoxItem id="north">Northwind</ComboBoxItem>
      <ComboBoxItem id="offer" isDisabled>Offer (locked)</ComboBoxItem>
    </ComboBox>
  </main>
);

describe('ComboBox', () => {
  it('is a labelled combobox with list autocomplete; typing filters and opens; the list is non-modal', async () => {
    const user = userEvent.setup();
    const { container } = render(field());
    const input = screen.getByRole('combobox', { name: 'Company' });
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /Show suggestions/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(input);
    await user.keyboard('or');
    const listbox = await screen.findByRole('listbox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['Orbit', 'Northwind']);
    expect(input).toHaveFocus(); // focus never leaves the input
    expect(container.querySelector('main')).not.toHaveAttribute('aria-hidden'); // non-modal: the page stays exposed
    expect(await axeOpen()).toHaveNoViolations();
  });

  it('arrows highlight via aria-activedescendant, skipping a disabled option; Enter picks and closes; onSelectionChange gets the id', async () => {
    const onSelectionChange = vi.fn();
    const user = userEvent.setup();
    render(field({ onSelectionChange }));
    const input = screen.getByRole('combobox', { name: 'Company' });
    await user.click(input);
    await user.keyboard('{ArrowDown}'); // opens with the first option highlighted
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', options[0]!.id));
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}'); // Lumen → Northwind → stays: Offer is skipped and the list does not wrap
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', options[2]!.id));
    await user.keyboard('{ArrowUp}{ArrowDown}'); // Lumen and back — the disabled option is never the highlight
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', options[2]!.id));
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('Northwind');
    expect(onSelectionChange).toHaveBeenLastCalledWith('north');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(input).toHaveFocus();
  });

  it('shows the empty message instead of silently closing; Escape cancels — closes and reverts the text', async () => {
    const user = userEvent.setup();
    render(field({ emptyMessage: 'No company matches' }));
    const input = screen.getByRole('combobox', { name: 'Company' });
    await user.click(input);
    await user.keyboard('zzz');
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveAttribute('data-empty', 'true');
    // React Aria exposes the empty state as a single non-selectable option, so it is read like a row.
    const rows = within(listbox).getAllByRole('option');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('No company matches');
    expect(screen.getByText('No company matches')).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(input).toHaveValue(''); // nothing was selected, so the edit is discarded
    expect(input).toHaveFocus();
  });

  it('without allowsCustomValue the text reverts on blur; with it, new text stays', async () => {
    const user = userEvent.setup();
    const { rerender } = render(field({ defaultSelectedKey: 'orbit' }));
    const input = screen.getByRole('combobox', { name: 'Company' });
    expect(input).toHaveValue('Orbit');
    await user.click(input);
    await user.keyboard('{Backspace}{Backspace}x');
    await user.tab();
    expect(input).toHaveValue('Orbit'); // half-typed value never reaches the form
    rerender(field({ allowsCustomValue: true }));
    const free = screen.getByRole('combobox', { name: 'Company' });
    await user.clear(free); // uncontrolled text survives the rerender
    await user.keyboard('Brand new');
    await user.tab();
    expect(free).toHaveValue('Brand new');
  });

  it('is required and invalid like TextField: aria-required, aria-invalid, description then error in aria-describedby', async () => {
    const { container, rerender } = render(field({ isRequired: true, description: 'From the tracker.', errorMessage: 'Choose a company' }));
    const input = screen.getByRole('combobox', { name: 'Company' });
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription(/^From the tracker\.\s*$/);
    rerender(field({ isRequired: true, isInvalid: true, description: 'From the tracker.', errorMessage: 'Choose a company' }));
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('From the tracker. Choose a company');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('the toggle button opens the list with every option; read-only and disabled do not open', async () => {
    const user = userEvent.setup();
    const { rerender } = render(field());
    await user.click(screen.getByRole('button', { name: /Show suggestions/ }));
    expect(within(await screen.findByRole('listbox')).getAllByRole('option')).toHaveLength(4);
    rerender(<div />);
    rerender(field({ isReadOnly: true, defaultSelectedKey: 'orbit' })); // fresh mount: defaultSelectedKey is read once
    const ro = screen.getByRole('combobox', { name: 'Company' });
    expect(ro).toHaveAttribute('readonly'); // native readonly on the input (React Aria), not aria-readonly
    expect(ro).toHaveValue('Orbit');
    rerender(field({ isDisabled: true }));
    expect(screen.getByRole('combobox', { name: 'Company' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Show suggestions/ })).toBeDisabled();
  });
});
