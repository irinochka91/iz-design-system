import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { WeeklyGoal, weeklyGoalFooter } from '@iz/design-system';

describe('WeeklyGoal', () => {
  it('is a meter named by its label, with the value, the range and the full sentence as value text', async () => {
    const { container } = render(<WeeklyGoal done={3} target={5} stretch={{ used: 0, quota: 1 }} lastWeek={5} />);
    const meter = screen.getByRole('meter', { name: 'Weekly goal' });
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '5');
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuetext', '3 of 5 quality applications');
    expect(meter).toHaveTextContent('3 / 5');
    expect(meter).toHaveTextContent('Stretch 0 of 1 used');
    expect(meter).toHaveTextContent('2 to go · last week 5/5');
    expect(meter).not.toHaveAttribute('data-met');
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-latest]')).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('met: data-met, the streak footer in a polite live region; over target the figure says 6 and the meter clamps', async () => {
    const { container, rerender } = render(<WeeklyGoal done={5} streakWeeks={7} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('data-met');
    const footer = screen.getByText('Goal met · 7-week streak').closest('p')!;
    expect(footer).toHaveAttribute('aria-live', 'polite');
    expect(footer).toHaveAttribute('aria-atomic', 'true');
    expect(await axe(container)).toHaveNoViolations();
    rerender(<WeeklyGoal done={6} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '5');
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '6 of 5 quality applications');
    expect(screen.getByRole('meter')).toHaveTextContent('6 / 5');
    expect(screen.getByText('Goal met')).toBeInTheDocument(); // no streak given: no streak claimed
  });

  it('at risk: warning state plus the next useful step — never a loss; the app can override the footer', () => {
    const { rerender } = render(<WeeklyGoal done={3} isAtRisk nextAction="Email Priya" />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-at-risk');
    expect(screen.getByText('2 to go · next: Email Priya')).toBeInTheDocument();
    rerender(<WeeklyGoal done={5} isAtRisk nextAction="Email Priya" />);
    expect(screen.getByRole('meter')).not.toHaveAttribute('data-at-risk'); // met wins
    rerender(<WeeklyGoal done={3} footer="Logged, not counted — fit 58" />);
    expect(screen.getByText('Logged, not counted — fit 58')).toBeInTheDocument();
  });

  it('derives the footer without judging', () => {
    expect(weeklyGoalFooter({ done: 0 })).toBe('5 to go');
    expect(weeklyGoalFooter({ done: 4, target: 5, lastWeek: 3 })).toBe('1 to go · last week 3/5');
    expect(weeklyGoalFooter({ done: 3, isAtRisk: true, nextAction: 'Email Priya' })).toBe('2 to go · next: Email Priya');
    expect(weeklyGoalFooter({ done: 5, streakWeeks: 1 })).toBe('Goal met');
    expect(weeklyGoalFooter({ done: 5, streakWeeks: 7 })).toBe('Goal met · 7-week streak');
  });
});
