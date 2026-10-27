import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { StageChip, stageEmphasis } from '@iz/design-system';

describe('StageChip', () => {
  it('is a static chip named by the stage when there is no onChange; terminal stages are always static', async () => {
    const { container, rerender } = render(<StageChip stage="Interview" />);
    expect(screen.getByText('Interview')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<StageChip stage="Rejected" onChange={vi.fn()} />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('with onChange it is a button that says what pressing does; press advances; Offer is final', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container, rerender } = render(<StageChip stage="Screen" onChange={onChange} />);
    const chip = screen.getByRole('button', { name: 'Stage: Screen. Press to advance' });
    await user.click(chip);
    expect(onChange).toHaveBeenLastCalledWith('Interview', 'Screen');
    expect(await axe(container)).toHaveNoViolations();
    rerender(<StageChip stage="Offer" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Stage: Offer. Final stage' }));
    expect(onChange).toHaveBeenCalledTimes(1); // nothing wraps
  });

  it('Shift+→ advances and Shift+← reverts on the button itself; plain arrows and Lead←, Offer→ do nothing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<StageChip stage="Screen" onChange={onChange} />);
    await user.tab();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith('Interview', 'Screen');
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(onChange).toHaveBeenLastCalledWith('Applied', 'Screen');
    await user.keyboard('{ArrowRight}{ArrowLeft}');
    expect(onChange).toHaveBeenCalledTimes(2);
    rerender(<StageChip stage="Interview" onChange={onChange} />); // the app applied it: same button, focus stays
    expect(screen.getByRole('button', { name: 'Stage: Interview. Press to advance' })).toHaveFocus();
    rerender(<StageChip stage="Lead" onChange={onChange} />);
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('exports the one stage → emphasis mapping and marks the stage on the wrapper', () => {
    expect(stageEmphasis).toEqual({
      Lead: 'quiet',
      Applied: 'quiet',
      Screen: 'quiet',
      Interview: 'tint',
      Offer: 'strong',
      Rejected: 'quiet',
      Withdrawn: 'quiet',
    });
    const { container } = render(<StageChip stage="Offer" />);
    expect(container.querySelector('[data-stage="Offer"]')).toBeInTheDocument();
  });
});
