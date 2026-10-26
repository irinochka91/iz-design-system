import { useState } from 'react';

/**
 * React Aria positions overlays with a number. The gap to a trigger is a spacing token: read it from the
 * computed style once, lazily, on first render — no effect, no setState-in-effect (React Compiler rule) —
 * so the token stays the source of truth. The one place a token value crosses into JavaScript.
 * Shared by Popover and Tooltip.
 */
export const useTokenPx = (name: string, fallback: number) => {
  const [px] = useState(() => {
    if (typeof document === 'undefined') return fallback;
    const parsed = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(parsed) ? parsed : fallback;
  });
  return px;
};
