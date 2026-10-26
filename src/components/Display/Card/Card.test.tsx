import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Card } from '@iz/design-system';

describe('Card', () => {
  it('is a plain div by default: no role, not focusable, nothing announced', async () => {
    const user = userEvent.setup();
    const { container } = render(<Card>Content</Card>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe('DIV');
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
    await user.tab();
    expect(document.activeElement).toBe(document.body);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('as="section" with aria-labelledby is a named region', async () => {
    const { container } = render(
      <Card as="section" aria-labelledby="h">
        <h2 id="h">This week</h2>
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'This week' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('as="article" is an article; as="li" renders a list item', () => {
    const { rerender } = render(<Card as="article">Item</Card>);
    expect(screen.getByRole('article')).toBeInTheDocument();
    rerender(
      <ul>
        <Card as="li">Item</Card>
      </ul>,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('forwards className last so consumers can add layout classes', () => {
    const { container } = render(<Card className="my-layout">X</Card>);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/my-layout$/);
  });
});
