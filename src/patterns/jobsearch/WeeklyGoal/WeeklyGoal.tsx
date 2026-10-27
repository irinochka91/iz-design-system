import { forwardRef, useId } from 'react';
import styles from './WeeklyGoal.module.css';

export type WeeklyGoalProps = {
  /** Quality applications done this week — counted by the app (fit ≥ 70 or marked Stretch). */
  done: number;
  target?: number;
  /** 'Stretch 1 of 1 used'. Omit to hide. */
  stretch?: { used: number; quota: number };
  /** Consecutive weeks met, counting this one once met. */
  streakWeeks?: number;
  /** The app's call (Saturday with ≥ 2 to go). */
  isAtRisk?: boolean;
  /** Next useful step for the at-risk footer. */
  nextAction?: string;
  /** Last week's count for the in-progress footer. */
  lastWeek?: number;
  /** Overrides the derived footer (a one-off line, or a localised sentence). */
  footer?: string;
  label?: string;
  className?: string;
};

export const weeklyGoalFooter = ({ done, target = 5, streakWeeks, isAtRisk, nextAction, lastWeek }: WeeklyGoalProps): string => {
  const toGo = Math.max(target - done, 0);
  if (toGo === 0) return streakWeeks && streakWeeks > 1 ? `Goal met · ${streakWeeks}-week streak` : 'Goal met';
  if (isAtRisk && nextAction) return `${toGo} to go · next: ${nextAction}`;
  if (lastWeek !== undefined) return `${toGo} to go · last week ${lastWeek}/${target}`;
  return `${toGo} to go`;
};

/**
 * WeeklyGoal — the gauge on Today. A meter (label, figure, five bars, footer) whose goal-met moment plays
 * once on the Done that reaches the target; under target it says what to do next, never what was lost.
 * Not interactive; StreakBar and the adjust prompt are a later pattern. Spec: ./WeeklyGoal.spec.json
 */
export const WeeklyGoal = forwardRef<HTMLDivElement, WeeklyGoalProps>(function WeeklyGoal(props, ref) {
  const { done, target = 5, stretch, isAtRisk = false, footer, label = 'Weekly goal', className } = props;
  const labelId = useId();
  const met = done >= target;
  const text = footer ?? weeklyGoalFooter(props);
  const classes = [styles.root, className].filter(Boolean).join(' ');
  return (
    <div
      ref={ref}
      className={classes}
      role="meter"
      aria-labelledby={labelId}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={Math.min(done, target)}
      aria-valuetext={`${done} of ${target} quality applications`}
      {...(met ? { 'data-met': true } : {})}
      {...(isAtRisk && !met ? { 'data-at-risk': true } : {})}
    >
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      {/* The figure: the done digit rolls on change (keyed), the target stays. Tabular numerals keep the width. */}
      <span className={styles.figure} aria-hidden="true">
        <span className={styles.rollBox}>
          <span key={done} className={styles.roll}>
            {done}
          </span>
        </span>
        <span className={styles.target}> / {target}</span>
      </span>
      {stretch && (
        <span className={styles.stretch}>
          Stretch {stretch.used} of {stretch.quota} used
        </span>
      )}
      {/* Decoration: the meter already carries the value. The latest lit bar is keyed so only it animates. */}
      <span className={styles.bars} aria-hidden="true">
        {Array.from({ length: target }, (_, i) => {
          const lit = i < done;
          const latest = lit && i === Math.min(done, target) - 1;
          return (
            <span
              key={latest ? `latest-${done}` : i}
              className={styles.bar}
              {...(lit ? { 'data-lit': true } : {})}
              {...(latest ? { 'data-latest': true } : {})}
            />
          );
        })}
      </span>
      {/* The one live region: the met line once, the next step when at risk. Keyed so it crossfades. */}
      <p className={styles.footer} aria-live="polite" aria-atomic="true">
        <span key={text} className={styles.footerText}>
          {text}
        </span>
      </p>
    </div>
  );
});
