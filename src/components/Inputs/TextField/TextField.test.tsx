import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TextField } from '@iz/design-system';

describe('TextField', () => {
  it('takes its name from the visible label and has no axe violations', async () => {
    const { container } = render(<TextField label="Company" />);
    expect(screen.getByRole('textbox', { name: 'Company' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('takes its name from aria-label when there is no visible label', async () => {
    const { container } = render(<TextField aria-label="Add an action" kbdHint="N" />);
    expect(screen.getByRole('textbox', { name: 'Add an action' })).toBeInTheDocument();
    // the kbd hint is decorative
    expect(screen.getByText('N').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('links description and error through aria-describedby; the error element exists before it is shown', async () => {
    const { rerender, container } = render(
      <TextField label="Salary floor" description="Numbers only." errorMessage="Enter a number" />,
    );
    const input = screen.getByRole('textbox', { name: 'Salary floor' });
    // The empty error element is already referenced, so the computed description carries a trailing
    // space — invisible to assistive tech (whitespace collapses when spoken), hence the regex.
    expect(input).toHaveAccessibleDescription(/^Numbers only\.\s*$/);
    expect(input).not.toHaveAttribute('aria-invalid');
    // the error container is in the DOM, empty
    expect(container.querySelector('[slot="errorMessage"]')).toBeInTheDocument();

    rerender(<TextField label="Salary floor" description="Numbers only." errorMessage="Enter a number" isInvalid />);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/^Numbers only\.\s+Enter a number$/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('exposes required and read-only semantically, not just visually', () => {
    const { rerender } = render(<TextField label="Email" isRequired />);
    const input = screen.getByRole('textbox', { name: /Email/ });
    expect(input).toHaveAttribute('aria-required', 'true');

    rerender(<TextField label="Email" isReadOnly defaultValue="a@b.c" />);
    expect(input).toHaveAttribute('readonly');
    expect(input).not.toBeDisabled(); // read-only stays focusable and copyable
  });

  it('calls onChange with the string, and leaves Enter and Escape alone', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="Type" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Type' });
    await user.tab();
    expect(input).toHaveFocus();
    await user.keyboard('Orbit');
    expect(onChange).toHaveBeenLastCalledWith('Orbit');
    await user.keyboard('{Enter}{Escape}');
    expect(input).toHaveValue('Orbit');
  });

  it('disabled is out of the tab order', async () => {
    const user = userEvent.setup();
    render(<TextField label="Off" isDisabled />);
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Off' })).not.toHaveFocus();
  });

  it('forwards className last so consumers can add layout classes', () => {
    const { container } = render(<TextField label="X" className="my-layout" />);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/my-layout$/);
  });
});
