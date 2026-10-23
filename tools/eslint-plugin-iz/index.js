/**
 * eslint-plugin-iz — the two guards the handoff takes from Atlassian:
 *   iz/no-raw-colors   a colour literal in component or app code is a build error
 *   iz/no-raw-spacing  a px/rem/em/ms length literal is a build error
 *
 * CSS files are stylelint's job (`color-no-hex`, `unit-disallowed-list` in .stylelintrc.json);
 * these rules cover the TS/TSX side, where a raw value hides in a string or template literal.
 * Both rules read every string and template literal, so `style={{ color: '#ff0000' }}`,
 * `` css`color: ${'#f00'}` `` and a stray `'16px'` in a prop default are all caught.
 */

const HEX = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\s*\(/i;
// Named CSS colours worth catching: the ones people actually type.
const NAMED = /\b(?:red|green|blue|yellow|orange|purple|pink|brown|gray|grey|white|black|cyan|magenta|teal|navy|olive|maroon|lime|aqua|fuchsia|silver|gold|crimson|salmon|khaki|indigo|violet|turquoise|tomato|coral|beige|ivory|lavender)\b/i;
// A colour-ish property name next to the value makes a named colour unambiguous.
const COLOR_CONTEXT = /\b(?:color|background|background-color|border-color|outline-color|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|text-decoration-color)\s*:/i;
const LENGTH = /(?:^|[^\w.-])(?:\d+(?:\.\d+)?)(px|rem|em|ms)\b/i;

/** Values that are not design decisions. */
const ALLOWED_COLORS = /^(?:transparent|currentcolor|inherit|initial|unset|revert|none|auto)$/i;
const ZERO_LENGTH = /^0(?:px|rem|em|ms)?$/i;

const EXEMPT = [
  /[\\/]tokens[\\/]/,           // the token source is where raw values belong
  /[\\/]scripts[\\/]/,          // build and check scripts
  /[\\/]tools[\\/]/,            // this plugin
  /\.test\.(?:ts|tsx)$/,        // tests may assert on computed values
  /\.e2e\.ts$/,
  /\.stories\.tsx$/,            // stories may demo an escape hatch, explicitly
  /eslint\.config\.js$/,
  /\.config\.(?:ts|js|mjs)$/,
];
const exempt = (filename) => EXEMPT.some((re) => re.test(filename));

/** Every string and template-literal chunk in the file, with the node to report on. */
function literalVisitors(check) {
  return {
    Literal(node) {
      if (typeof node.value === 'string') check(node.value, node);
    },
    TemplateElement(node) {
      if (typeof node.value?.cooked === 'string') check(node.value.cooked, node);
    },
  };
}

const noRawColors = {
  meta: {
    type: 'problem',
    docs: { description: 'Use a var(--iz-color-*) token instead of a colour literal.' },
    schema: [],
    messages: {
      hex: 'Raw colour "{{value}}". Use a semantic token: var(--iz-color-*) — see docs/TOKENS.md. If a new role is needed, add it to tokens/semantic/color.json.',
      fn: 'Raw colour function "{{value}}". Colours come from tokens/primitives; a component references var(--iz-color-*) only.',
      named: 'Named CSS colour "{{value}}". Use var(--iz-color-*) so the value changes with the theme.',
    },
  },
  create(context) {
    if (exempt(context.filename)) return {};
    return literalVisitors((text, node) => {
      const value = text.trim();
      if (ALLOWED_COLORS.test(value)) return;
      if (HEX.test(text)) context.report({ node, messageId: 'hex', data: { value: text.match(HEX)[0] } });
      else if (COLOR_FN.test(text)) context.report({ node, messageId: 'fn', data: { value: text.match(COLOR_FN)[0].trim() } });
      else if (COLOR_CONTEXT.test(text) && NAMED.test(text)) context.report({ node, messageId: 'named', data: { value: text.match(NAMED)[0] } });
    });
  },
};

const noRawSpacing = {
  meta: {
    type: 'problem',
    docs: { description: 'Use a var(--iz-space-*) / --iz-radius-* / --iz-motion-* token instead of a length literal.' },
    schema: [],
    messages: {
      length: 'Raw length "{{value}}". Use a token: var(--iz-space-*) for gaps and padding, --iz-radius-* for corners, --iz-size-target-* for hit areas, --iz-motion-duration-* for time. 0 and % need no token.',
    },
  },
  create(context) {
    if (exempt(context.filename)) return {};
    return literalVisitors((text, node) => {
      if (ZERO_LENGTH.test(text.trim())) return;
      const m = text.match(LENGTH);
      if (m && !ZERO_LENGTH.test(m[0].trim())) context.report({ node, messageId: 'length', data: { value: m[0].trim() } });
    });
  },
};

export default {
  meta: { name: 'eslint-plugin-iz', version: '0.0.1' },
  rules: { 'no-raw-colors': noRawColors, 'no-raw-spacing': noRawSpacing },
};
