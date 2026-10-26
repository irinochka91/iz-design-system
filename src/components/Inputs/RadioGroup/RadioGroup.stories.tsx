import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RadioGroup, Radio, type RadioGroupProps } from './RadioGroup';

// Every story is an axe test (preview.ts: a11y.test = 'error'). Use the Theme toolbar to check all six themes.
const roleTypes = [
  <Radio key="ic" value="ic">Individual contributor</Radio>,
  <Radio key="lead" value="lead">Lead</Radio>,
  <Radio key="manager" value="manager">Manager</Radio>,
] as RadioGroupProps['children'];

const meta = {
  title: 'Inputs/RadioGroup',
  component: RadioGroup,
  subcomponents: { Radio },
  args: { label: 'Role type', name: 'roleType', children: roleTypes, size: 'md', onChange: fn() },
  argTypes: {
    size: { control: 'radio', options: ['md', 'lg'] },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** No default: a genuine question. Tab lands on the first option; arrows move and select. */
export const Default: Story = {};
export const Selected: Story = { args: { defaultValue: 'lead' } };
export const WithDescription: Story = {
  args: { label: 'Window', description: 'How long the experiment runs.', defaultValue: '14', orientation: 'horizontal',
    children: [<Radio key="14" value="14">14 days</Radio>, <Radio key="30" value="30">30 days</Radio>] as RadioGroupProps['children'] },
};
export const Required: Story = { args: { isRequired: true } };

/** Invalid is group-level and never colour-only: danger ring on every radio, one error text, aria-invalid on the group. */
export const Invalid: Story = {
  args: { isRequired: true, isInvalid: true, errorMessage: 'Choose a role type' },
};
export const OneDisabled: Story = {
  args: { label: 'Lead source', defaultValue: 'board',
    children: [<Radio key="b" value="board">Job board</Radio>, <Radio key="r" value="referral">Referral</Radio>, <Radio key="i" value="import" isDisabled>Import (coming)</Radio>] as RadioGroupProps['children'] },
};
export const Disabled: Story = { args: { isDisabled: true, defaultValue: 'ic' } };
export const ReadOnly: Story = { args: { isReadOnly: true, defaultValue: 'ic', description: 'Set by the lead source.' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="sb-row">
      <RadioGroup {...args} label="Medium rows 24px" size="md" />
      <RadioGroup {...args} label="Large rows 44px" size="lg" />
    </div>
  ),
};

/** Keyboard contract from RadioGroup.spec.json: one tab stop, arrows move AND select, Space selects. */
export const Keyboard: Story = {
  args: { label: 'Press arrows' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const [ic, lead, manager] = canvas.getAllByRole('radio');
    await userEvent.tab();
    await expect(ic).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(lead).toHaveFocus();
    await expect(lead).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith('lead');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}'); // wraps to the last
    await expect(manager).toBeChecked();
    await userEvent.tab();
    await expect(canvas.queryByRole('radio', { checked: true })).not.toHaveFocus(); // one tab stop: Tab leaves the group
  },
};
