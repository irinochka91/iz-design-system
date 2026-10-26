import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Chip } from '../Chip';
import { Button } from '../../Actions/Button';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar — linen is the one to check.
const meta = {
  title: 'Display/Card',
  component: Card,
  argTypes: {
    variant: { control: 'radio', options: ['surface', 'raised'] },
    padding: { control: 'radio', options: ['md', 'lg'] },
    radius: { control: 'radio', options: ['lg', 'xl'] },
    as: { control: 'radio', options: ['div', 'section', 'article', 'li'] },
  },
  args: {
    children: (
      <>
        <h3>Orbit — Senior Product Designer</h3>
        <p>Sydney · Hybrid · Posted 2 days ago</p>
        <Chip variant="stage" emphasis="tint">Interview</Chip>
      </>
    ),
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Surface: Story = {};
export const Raised: Story = { args: { variant: 'raised' } };
export const PhonePadding: Story = { args: { padding: 'md' } };

/** The triage card: radius xl, phone padding, article semantics. */
export const Triage: Story = {
  args: {
    radius: 'xl',
    padding: 'md',
    as: 'article',
    children: (
      <>
        <h3>Orbit — Senior Product Designer</h3>
        <p>Fit 82 · Priorities 3 of 4 · ~2.5 h: tailored résumé + cover letter</p>
        <div className="sb-row">
          <Button variant="primary">Apply</Button>
          <Button>Stretch</Button>
          <Button variant="tertiary">Skip</Button>
        </div>
      </>
    ),
  },
};

/** A named region: section + aria-labelledby pointing at the heading inside. */
export const NamedRegion: Story = {
  args: {
    as: 'section',
    'aria-labelledby': 'goal-heading',
    children: (
      <>
        <h2 id="goal-heading">This week</h2>
        <p>4 / 5 quality applications · 1 more by Sunday</p>
      </>
    ),
  },
};

/** Recommendation 5 from the Phase 1 review: does a white card read as separate on linen's warm page with only a 1 px edge? */
export const LinenSeparation: Story = {
  render: () => (
    <div className="sb-row">
      {['Orbit', 'Canva', 'Atlassian', 'Rode', 'Culture Amp', 'SafetyCulture'].map((company) => (
        <Card key={company} as="article">
          <h3>{company}</h3>
          <p>Senior Product Designer</p>
          <Chip variant="stage">Applied</Chip>
        </Card>
      ))}
    </div>
  ),
};

export const LongUkrainianContent: Story = {
  args: {
    padding: 'md',
    children: (
      <>
        <h3>Старший продуктовий дизайнер, команда платформи для роботодавців</h3>
        <p>Сідней · гібридно · опубліковано позавчора · 3 з 4 пріоритетів збігаються</p>
      </>
    ),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
