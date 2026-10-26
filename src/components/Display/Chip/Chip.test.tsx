import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Chip } from '@iz/design-system';

describe('Chip', () => {
  it('a property chip is a span with no role and is not focusable', async () => {
    const user = userEvent.setup();
    const { container } = render(<Chip>Orbit</Chip>);
    const chip = screen.getByText('Orbit').closest('span.iz-chip, span');
    expect(container.querySelector('button')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    await user.tab();
    expect(document.activeElement).toBe(document.body);
    expect(chip).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('a filter chip is a toggle button: aria-pressed follows selection, Space and Enter toggle', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Chip variant="filter" onChange={onChange}>Matches my priorities</Chip>);
    const toggle = screen.getByRole('button', { name: 'Matches my priorities' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.tab();
    expect(toggle).toHaveFocus();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(true);
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('selected filter is controlled and exposes data-selected for the never-colour-only styling', () => {
    render(<Chip variant="filter" isSelected>Remote</Chip>);
    const toggle = screen.getByRole('button', { name: 'Remote' });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('data-selected');
  });

  it('a stage chip is static without onPress and a button with it, named by aria-label', async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    const { rerender, container } = render(<Chip variant="stage">Screen</Chip>);
    expect(screen.queryByRole('button')).toBeNull();

    rerender(<Chip variant="stage" aria-label="Stage: Screen. Press to advance" onPress={onPress}>Screen</Chip>);
    const button = screen.getByRole('button', { name: 'Stage: Screen. Press to advance' });
    expect(button).not.toHaveAttribute('aria-pressed'); // a press, not a toggle
    await user.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('disabled interactive chip is out of the tab order', async () => {
    const user = userEvent.setup();
    render(<Chip variant="filter" isDisabled>Remote only</Chip>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remote only' })).not.toHaveFocus();
  });

  it('a decorative icon is hidden from AT and the state lives in text', () => {
    render(
      <Chip iconStart={<svg data-testid="tick" />}>
        Hybrid<span className="iz-visually-hidden">, met</span>
      </Chip>,
    );
    expect(screen.getByTestId('tick').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText(/Hybrid/).closest('span')?.textContent).toBe('Hybrid, met');
  });

  it('forwards className last so consumers can add layout classes', () => {
    const { container } = render(<Chip className="my-layout">X</Chip>);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/my-layout$/);
  });
});
