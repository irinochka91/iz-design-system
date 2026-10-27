import { forwardRef, type KeyboardEvent } from 'react';
import { Chip, type ChipEmphasis } from '../../../components/Display/Chip';
import styles from './StageChip.module.css';

export const STAGES = ['Lead', 'Applied', 'Screen', 'Interview', 'Offer'] as const;
export type Stage = (typeof STAGES)[number];
export type TerminalStage = 'Rejected' | 'Withdrawn';

/** The one stage → emphasis mapping (handoff): every stage quiet, Interview tint, Offer the single strong. */
export const stageEmphasis: Record<Stage | TerminalStage, ChipEmphasis> = {
  Lead: 'quiet',
  Applied: 'quiet',
  Screen: 'quiet',
  Interview: 'tint',
  Offer: 'strong',
  Rejected: 'quiet',
  Withdrawn: 'quiet',
};

export type StageChipProps = {
  /** Controlled. Rejected and Withdrawn are terminal and always static. */
  stage: Stage | TerminalStage;
  /** Makes the chip a cycling button. Fires at once; the app applies it and shows the Undo toast. */
  onChange?: (next: Stage, prev: Stage) => void;
  isDisabled?: boolean;
  className?: string;
};

const isStage = (s: string): s is Stage => (STAGES as readonly string[]).includes(s);

/**
 * StageChip — the one chip for a pipeline stage, everywhere. Static by default; with onChange a cycling
 * button: press / Shift+→ advance, Shift+← reverts, Offer is final, nothing wraps, nothing is confirmed.
 * The flip on change remounts only the label (key={stage}) — never the button, or keyboard focus would be
 * lost on every change. Spec: ./StageChip.spec.json
 */
export const StageChip = forwardRef<HTMLElement, StageChipProps>(function StageChip(
  { stage, onChange, isDisabled, className },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');
  const emphasis = stageEmphasis[stage];

  if (!onChange || !isStage(stage)) {
    return (
      <span className={classes} data-stage={stage}>
        <Chip ref={ref} variant="stage" emphasis={emphasis}>
          <span key={stage} className={styles.flip}>
            {stage}
          </span>
        </Chip>
      </span>
    );
  }

  const index = STAGES.indexOf(stage);
  const next = STAGES[index + 1];
  const prev = STAGES[index - 1];
  const advance = () => next && onChange(next, stage);
  const revert = () => prev && onChange(prev, stage);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!e.shiftKey) return; // plain arrows belong to the list and to text fields
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      advance();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      revert();
    }
  };

  return (
    <span className={classes} data-stage={stage}>
      <Chip
        ref={ref}
        variant="stage"
        emphasis={emphasis}
        aria-label={next ? `Stage: ${stage}. Press to advance` : `Stage: ${stage}. Final stage`}
        onPress={advance}
        onKeyDown={onKeyDown}
        {...(isDisabled !== undefined ? { isDisabled } : {})}
      >
        <span key={stage} className={styles.flip}>
          {stage}
        </span>
      </Chip>
    </span>
  );
});
