import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within, screen, waitFor } from 'storybook/test';
import { Collection } from 'react-aria-components';
import { ComboBox, ComboBoxItem, ComboBoxSection, ComboBoxHeader, ComboBoxDescription, type ComboBoxProps } from './ComboBox';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Type to filter; arrows highlight; Enter picks.
type Company = { id: string; name: string; stage?: string };
const companies: Company[] = [
  { id: 'orbit', name: 'Orbit', stage: 'Interview' },
  { id: 'lumen', name: 'Lumen Health', stage: 'Applied' },
  { id: 'kite', name: 'Kite Labs', stage: 'Screen' },
  { id: 'north', name: 'Northwind', stage: 'Applied' },
  { id: 'atlas', name: 'Atlas Studio' },
  { id: 'ferro', name: 'Ferro' },
  { id: 'marlow', name: 'Marlow & Co' },
  { id: 'sable', name: 'Sable' },
  { id: 'quill', name: 'Quill' },
  { id: 'verdant', name: 'Verdant' },
  { id: 'halo', name: 'Halo Systems' },
  { id: 'onyx', name: 'Onyx Digital' },
];
const renderCompany = (c: Company) => (
  <ComboBoxItem id={c.id} textValue={c.name}>
    {c.name}
    {c.stage && <ComboBoxDescription>{c.stage}</ComboBoxDescription>}
  </ComboBoxItem>
);

const meta = {
  title: 'Inputs/ComboBox',
  component: ComboBox,
  subcomponents: { ComboBoxItem, ComboBoxSection, ComboBoxHeader },
  args: {
    label: 'Company',
    defaultItems: companies,
    children: renderCompany,
    size: 'md',
    onSelectionChange: fn(),
    onInputChange: fn(),
  } as ComboBoxProps<Company>,
  argTypes: {
    size: { control: 'radio', options: ['md', 'lg'] },
    menuTrigger: { control: 'radio', options: ['input', 'focus', 'manual'] },
  },
} satisfies Meta<typeof ComboBox<Company>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Plain, no play — Playwright drives this one (ComboBox.e2e.ts). 12 companies: the list scrolls after 8. */
export const Default: Story = {};
export const Selected: Story = { args: { defaultSelectedKey: 'orbit' } };
export const WithDescription: Story = { args: { description: 'Start typing; pick from the tracker.' } };
export const Required: Story = { args: { isRequired: true } };

/** Invalid is never colour-only: thicker danger border, error text, aria-invalid + aria-describedby. */
export const Invalid: Story = { args: { isRequired: true, isInvalid: true, errorMessage: 'Choose a company' } };
export const Disabled: Story = { args: { isDisabled: true, defaultSelectedKey: 'orbit' } };
export const ReadOnly: Story = { args: { isReadOnly: true, defaultSelectedKey: 'orbit' } };

/** Quick-add style: no visible label, new text is fine, the list only opens on demand (button / Arrow Down). */
export const CustomValue: Story = {
  args: { label: undefined, 'aria-label': 'Company', allowsCustomValue: true, menuTrigger: 'manual', placeholder: 'Company' },
};

/** Static stories drop the dynamic collection (and the label they override) from args — exactOptionalPropertyTypes
    forbids `defaultItems: undefined`, and Storybook types args for a generic `object` item, not Company. */
type StaticArgs = Omit<ComboBoxProps<Company>, 'defaultItems' | 'items' | 'children' | 'label' | 'aria-label'>;
const withoutItems = (args: object): StaticArgs => {
  const { defaultItems, items, children, label, ...rest } = args as Record<string, unknown>;
  void defaultItems;
  void items;
  void children;
  void label;
  return rest as StaticArgs;
};

/** Opens on focus: a short, known list where typing is optional. */
export const OpensOnFocus: Story = {
  render: (args) => (
    <ComboBox {...withoutItems(args)} label="Stage" menuTrigger="focus">
      <ComboBoxItem id="applied">Applied</ComboBoxItem>
      <ComboBoxItem id="screen">Screen</ComboBoxItem>
      <ComboBoxItem id="interview">Interview</ComboBoxItem>
      <ComboBoxItem id="offer" isDisabled>Offer</ComboBoxItem>
    </ComboBox>
  ),
};

/** Grouped results, as the command palette will use them. */
export const Grouped: Story = {
  render: (args) => (
    <ComboBox {...withoutItems(args)} label="Search">
      <ComboBoxSection id="companies">
        <ComboBoxHeader>Companies</ComboBoxHeader>
        <Collection items={companies.slice(0, 3)}>{renderCompany}</Collection>
      </ComboBoxSection>
      <ComboBoxSection id="commands">
        <ComboBoxHeader>Commands</ComboBoxHeader>
        <ComboBoxItem id="new-action">New action</ComboBoxItem>
        <ComboBoxItem id="focus-mode">Focus mode</ComboBoxItem>
      </ComboBoxSection>
    </ComboBox>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <ComboBox {...args} label="Medium 40px" size="md" />
      <ComboBox {...args} label="Large 44px" size="lg" />
    </div>
  ),
};

/** Keyboard contract from ComboBox.spec.json: typing filters and opens, arrows highlight, Enter picks, Escape closes. */
export const Keyboard: Story = {
  args: { label: 'Type "or"' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Type "or"' });
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.keyboard('or');
    const listbox = await screen.findByRole('listbox');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(within(listbox).getAllByRole('option')).toHaveLength(2); // Orbit, Northwind
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', within(listbox).getByRole('option', { name: /Orbit/ }).id));
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Orbit');
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('orbit');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(input).toHaveFocus();
  },
};
