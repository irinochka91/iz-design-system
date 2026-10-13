import type { Meta, StoryObj } from '@storybook/react-vite';

// A single story proves Storybook + addon-a11y + addon-vitest run end to end before any component exists.
const Welcome = () => (
  <main>
    <h1>IZ Design System</h1>
    <p>Phase 0 scaffold. Components arrive one per learning cycle.</p>
  </main>
);

const meta = { title: 'Foundations/Welcome', component: Welcome } satisfies Meta<typeof Welcome>;
export default meta;

export const Default: StoryObj<typeof meta> = {};
