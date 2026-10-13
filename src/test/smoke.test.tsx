import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { VERSION } from '@iz/design-system';

// Proves the toolchain: TSX compiles, Testing Library renders, axe runs, path alias resolves.
describe('toolchain smoke test', () => {
  it('exports a version through the public entry point', () => {
    expect(VERSION).toBe('0.0.1');
  });

  it('runs axe on rendered markup', async () => {
    const { container } = render(
      <main>
        <h1>IZ Design System</h1>
        <button type="button">Hello</button>
      </main>,
    );
    expect(screen.getByRole('button', { name: 'Hello' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
