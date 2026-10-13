import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// vitest-axe's own extend-expect entry is empty in 0.1.0; register the matcher explicitly.
expect.extend(axeMatchers);

afterEach(() => cleanup());
