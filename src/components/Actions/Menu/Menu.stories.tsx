import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, screen, waitFor } from 'storybook/test';
import type { Key } from 'react-aria-components';
import { Menu, MenuItem, MenuSection, MenuHeader, MenuSeparator, MenuDescription, MenuKeyboard } from './Menu';
import { Button } from '../Button';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar — dark themes drop the shadow.
const meta = {
  title: 'Actions/Menu',
  component: Menu,
  args: { onAction: fn(), trigger: <Button>Snooze</Button>, children: null },
  argTypes: { placement: { control: 'radio', options: ['bottom start', 'bottom end', 'top start', 'top end'] } },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

const snoozeItems = (
  <>
    <MenuItem id="tomorrow">Tomorrow</MenuItem>
    <MenuItem id="+3d">
      In 3 days<MenuKeyboard>S</MenuKeyboard>
    </MenuItem>
    <MenuItem id="mon">Monday</MenuItem>
    <MenuSeparator />
    <MenuItem id="pick">Pick a date…</MenuItem>
  </>
);

/** The ActionRow snooze presets: four actions and a shortcut hint on the default. */
export const Snooze: Story = { args: { children: snoozeItems } };

/** The split button is a composition, owned by the pattern: default action + an icon-only trigger for the rest. */
const ChevronIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 6l4 4 4-4" />
  </svg>
);
export const SplitButton: Story = {
  render: (args) => (
    <div className="sb-row" role="group" aria-label="Snooze">
      <Button onPress={() => args.onAction?.('+3d')}>Snooze</Button>
      <Menu {...args} trigger={<Button aria-label="More snooze options" iconStart={<ChevronIcon />} />} placement="bottom end">
        {snoozeItems}
      </Menu>
    </div>
  ),
};

/** Single selection with sections: menuitemradio + aria-checked, and a terminal group. */
const SetStageDemo = () => {
  const [stage, setStage] = useState<Key>('screen');
  return (
    <Menu trigger={<Button>Stage: {String(stage)}</Button>} selectionMode="single" selectedKey={stage} onAction={setStage}>
      <MenuSection>
        <MenuHeader>Pipeline</MenuHeader>
        <MenuItem id="applied">Applied</MenuItem>
        <MenuItem id="screen">Screen</MenuItem>
        <MenuItem id="interview">Interview</MenuItem>
        <MenuItem id="offer">Offer</MenuItem>
      </MenuSection>
      <MenuSection>
        <MenuHeader>Close</MenuHeader>
        <MenuItem id="rejected">Rejected</MenuItem>
        <MenuItem id="withdrawn">Withdrawn</MenuItem>
      </MenuSection>
    </Menu>
  );
};
export const SetStage: Story = { render: () => <SetStageDemo /> };

export const WithDescriptions: Story = {
  args: {
    'aria-label': 'Row actions',
    trigger: <Button aria-label="Row actions">…</Button>,
    children: (
      <>
        <MenuItem id="open" textValue="Open">
          Open<MenuDescription>Show the application</MenuDescription>
        </MenuItem>
        <MenuItem id="copy" textValue="Copy link">
          Copy link<MenuDescription>To the job ad</MenuDescription>
        </MenuItem>
      </>
    ),
  },
};

export const DisabledItem: Story = { args: { children: snoozeItems, disabledKeys: ['pick'] } };
export const PlacementTopEnd: Story = { args: { children: snoozeItems, placement: 'top end' } };

export const LongUkrainianLabels: Story = {
  args: {
    trigger: <Button>Відкласти</Button>,
    children: (
      <>
        <MenuItem id="tomorrow">Завтра вранці</MenuItem>
        <MenuItem id="+3d">Через три дні, після співбесіди в Orbit</MenuItem>
        <MenuItem id="mon">У понеділок</MenuItem>
      </>
    ),
  },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

/** Keyboard contract from Menu.spec.json: ArrowDown opens on the first item, ArrowUp wraps, Escape returns focus. */
export const Keyboard: Story = {
  args: { children: snoozeItems },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Snooze' });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'true'); // ARIA: true ≡ menu
    await userEvent.keyboard('{ArrowDown}');
    const items = await screen.findAllByRole('menuitem'); // the popover portals to body
    // focus moves after React Aria's own effects — poll rather than assert once
    await waitFor(() => expect(items[0]).toHaveFocus());
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => expect(items[items.length - 1]).toHaveFocus()); // wraps
    await userEvent.tab(); // contained: nothing happens (modal popover, ADR-029)
    await waitFor(() => expect(items[items.length - 1]).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus()); // restored after the popover unmounts
    await expect(args.onAction).not.toHaveBeenCalled();
  },
};
