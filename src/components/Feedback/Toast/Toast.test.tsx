import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Toast } from '@iz/design-system';

describe('Toast', () => {
  it('is a status in a named landmark region, and does not take focus when shown', async () => {
    const { container, rerender } = render(
      <>
        <button type="button">Before</button>
        <Toast isOpen={false} onClose={vi.fn()}>Done</Toast>
      </>,
    );
    // the live region exists before any message
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
    // closed = hidden body; the status node stays mounted (and empty) so AT has the live region registered
    expect(screen.getByRole('status', { hidden: true })).toBeEmptyDOMElement();
    screen.getByRole('button', { name: 'Before' }).focus();
    rerender(
      <>
        <button type="button">Before</button>
        <Toast isOpen onClose={vi.fn()}>Done</Toast>
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Done');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus(); // never steals focus
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('timing (fake timers)', () => {
    // Fake only what Toast uses. user-event awaits setTimeout internally and hangs under fake timers even
    // with delay: null, so these tests drive the exact DOM events the component listens to with fireEvent.
    beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));
    afterEach(() => vi.useRealTimers()); // never leak fake timers into the next test, even after a failure

    it('auto-dismisses after the timeout, clamped to a 5 s floor', () => {
      const onClose = vi.fn();
      render(<Toast isOpen onClose={onClose} timeout={1000}>Done</Toast>);
      act(() => vi.advanceTimersByTime(4999));
      expect(onClose).not.toHaveBeenCalled(); // 1000 is clamped to 5000
      act(() => vi.advanceTimersByTime(1));
      expect(onClose).toHaveBeenLastCalledWith('timeout');
    });

    it('pauses while the pointer is over it and restarts the full timeout on leave', () => {
      const onClose = vi.fn();
      render(<Toast isOpen onClose={onClose} timeout={5000}>Done</Toast>);
      const region = screen.getByRole('region', { name: 'Notifications' });
      fireEvent.pointerEnter(region);
      act(() => vi.advanceTimersByTime(60_000));
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.pointerLeave(region);
      act(() => vi.advanceTimersByTime(4999));
      expect(onClose).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));
      expect(onClose).toHaveBeenLastCalledWith('timeout');
    });

    it('pauses while focus is inside, including moving between Undo and Dismiss', () => {
      const onClose = vi.fn();
      render(<Toast isOpen onClose={onClose} timeout={5000} action={{ label: 'Undo', onPress: vi.fn() }}>Done</Toast>);
      const undo = screen.getByRole('button', { name: 'Undo' });
      const dismiss = screen.getByRole('button', { name: 'Dismiss' });
      act(() => undo.focus());
      act(() => vi.advanceTimersByTime(60_000));
      expect(onClose).not.toHaveBeenCalled();
      // focus moves Undo → Dismiss: still inside the region, still paused
      fireEvent.blur(undo, { relatedTarget: dismiss });
      act(() => dismiss.focus());
      act(() => vi.advanceTimersByTime(60_000));
      expect(onClose).not.toHaveBeenCalled();
      // focus leaves the region: the clock restarts
      fireEvent.blur(dismiss, { relatedTarget: document.body });
      act(() => vi.advanceTimersByTime(5000));
      expect(onClose).toHaveBeenLastCalledWith('timeout');
    });
  });

  it('the action fires and closes with reason "action"; the close button closes with "dismiss"', async () => {
    const onClose = vi.fn();
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<Toast isOpen onClose={onClose} timeout={0} action={{ label: 'Undo', onPress }}>Done</Toast>);
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenLastCalledWith('action');
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onClose).toHaveBeenLastCalledWith('dismiss');
  });

  it('Escape dismisses only while focus is inside the toast', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Elsewhere</button>
        <Toast isOpen onClose={onClose} timeout={0} action={{ label: 'Undo', onPress: vi.fn() }}>Done</Toast>
      </>,
    );
    screen.getByRole('button', { name: 'Elsewhere' }).focus();
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Undo' }).focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenLastCalledWith('dismiss');
  });

  it('replaces the message in place and re-announces identical text via announceKey', () => {
    const { rerender } = render(<Toast isOpen onClose={vi.fn()} timeout={0} announceKey={1}>Done.</Toast>);
    const first = screen.getByRole('status');
    rerender(<Toast isOpen onClose={vi.fn()} timeout={0} announceKey={2}>Done.</Toast>);
    const second = screen.getByRole('status');
    expect(screen.getAllByRole('status')).toHaveLength(1); // one toast, ever
    expect(second).not.toBe(first); // a new node = a new announcement for the same text
  });
});
