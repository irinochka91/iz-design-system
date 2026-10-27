import { forwardRef } from 'react';
import { Button } from '../../../components/Actions/Button';
import { Chip, type ChipEmphasis } from '../../../components/Display/Chip';
import { Menu, MenuItem } from '../../../components/Actions/Menu';
import styles from './ActionRow.module.css';

export type ActionStage = 'Lead' | 'Applied' | 'Screen' | 'Interview' | 'Offer';
export type ActionGroup = 'overdue' | 'today' | 'week';
export type SnoozePreset = 'tomorrow' | '+3d' | 'monday' | 'pick';

export type Action = {
  id: string;
  /** The next step, imperative: 'Email Priya'. */
  title: string;
  company?: string;
  stage?: ActionStage;
  /** Preformatted by the app: '10:00'. */
  time?: string;
  /** Preformatted by the app: 'Today', 'Mon', '2 days ago'. The row formats nothing. */
  dueLabel: string;
};

export type ActionRowProps = {
  action: Action;
  group: ActionGroup;
  /** Controlled: the app flips it on onDone (applied at once) and back on Undo. */
  isDone?: boolean;
  onDone: (action: Action) => void;
  onSnooze: (preset: SnoozePreset, action: Action) => void;
  onOpen: (action: Action) => void;
  className?: string;
};

/** The handoff's stage colours (Chip spec): every stage quiet, Interview tint, Offer the one strong. StageChip will own this map. */
const STAGE_EMPHASIS: Record<ActionStage, ChipEmphasis> = {
  Lead: 'quiet',
  Applied: 'quiet',
  Screen: 'quiet',
  Interview: 'tint',
  Offer: 'strong',
};

const Ring = () => (
  <svg className={styles.ring} viewBox="0 0 24 24" aria-hidden="true">
    <circle className={styles.ringCircle} cx="12" cy="12" r="10" />
    <path className={styles.tick} d="M7 12.5l3.2 3.2L17 9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Chevron = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m4 6 4 4 4-4" />
  </svg>
);
const OpenIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" />
  </svg>
);

/**
 * ActionRow — one next action in the Today list. The done ring is a Button (one-way; Undo lives in the
 * list's toast), Snooze is a split button over a Menu, Open navigates. The row owns its controls and the
 * done moment; the list owns J/K/D/S/O, the groups, the live region and the toast (ADR-033).
 * Spec: ./ActionRow.spec.json
 */
export const ActionRow = forwardRef<HTMLLIElement, ActionRowProps>(function ActionRow(
  { action, group, isDone = false, onDone, onSnooze, onOpen, className },
  ref,
) {
  const { title } = action;
  return (
    <li
      ref={ref}
      className={[styles.row, className].filter(Boolean).join(' ')}
      data-group={group}
      {...(isDone ? { 'data-done': true } : {})}
    >
      {/* While done the collapsed content is inert and hidden from AT until the app removes or restores it. */}
      <div className={styles.inner} {...(isDone ? { inert: true, 'aria-hidden': true } : {})}>
        <div className={styles.content}>
          <Button
            size="lg"
            variant="tertiary"
            className={styles.done ?? ''}
            aria-label={`Mark done: ${title}`}
            aria-pressed={isDone}
            onPress={() => onDone(action)}
            iconStart={<Ring />}
          />
          <div className={styles.main}>
            <span className={styles.title}>{title}</span>
            <span className={styles.meta}>
              {action.company && <Chip>{action.company}</Chip>}
              {action.stage && (
                <Chip variant="stage" emphasis={STAGE_EMPHASIS[action.stage]}>
                  {action.stage}
                </Chip>
              )}
              {action.time && <span className={styles.time}>{action.time}</span>}
            </span>
          </div>
          <span className={styles.due}>{action.dueLabel}</span>
          <div className={styles.actions}>
            <div className={styles.snooze} role="group" aria-label={`Snooze: ${title}`}>
              <Button size="lg" onPress={() => onSnooze('+3d', action)}>
                Snooze
              </Button>
              <Menu
                placement="bottom end"
                trigger={<Button size="lg" aria-label={`Snooze options: ${title}`} iconStart={<Chevron />} />}
                onAction={(key) => onSnooze(key as SnoozePreset, action)}
              >
                <MenuItem id="tomorrow">Tomorrow</MenuItem>
                <MenuItem id="+3d">In 3 days</MenuItem>
                <MenuItem id="monday">Monday</MenuItem>
                <MenuItem id="pick">Pick a date…</MenuItem>
              </Menu>
            </div>
            <Button
              size="lg"
              variant="tertiary"
              aria-label={`Open: ${title}`}
              iconStart={<OpenIcon />}
              onPress={() => onOpen(action)}
            />
          </div>
        </div>
      </div>
    </li>
  );
});
