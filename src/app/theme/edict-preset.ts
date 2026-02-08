import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

/**
 * Edict preset: Aura theme with teal as primary.
 * All PrimeNG components use design tokens from this preset; no manual overrides needed.
 */
export const EdictPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{teal.50}',
      100: '{teal.100}',
      200: '{teal.200}',
      300: '{teal.300}',
      400: '{teal.400}',
      500: '{teal.500}',
      600: '{teal.600}',
      700: '{teal.700}',
      800: '{teal.800}',
      900: '{teal.900}',
      950: '{teal.950}',
    },
  },
});
