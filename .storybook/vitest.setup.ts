import { setProjectAnnotations } from '@storybook/react-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview';

// Applies preview.ts (theme decorator, a11y params) to every story run under Vitest.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
