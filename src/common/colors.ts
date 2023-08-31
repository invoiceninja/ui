/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const $1 = {
  $1: '#182433',
  $2: '#151f2c',
  $3: '#ffffff',
  $4: '#1f2e41',
  $5: '#1f2e41',
  $6: '#151f2c',
  $7: '#151f2c',
  $8: '#1f2e41',
  $9: '#ffffff',
};

export const $2 = {
  $1: '#ffffff', // Primary background
  $2: '#f7f7f7', // Secondary background
  $3: '#2a303d', // Primary text
  $4: '#f7f7f7', // Primary border
  $5: '#d1d5db', // Secondary border (sidebar)
  $6: '#242930', // Secondary background
  $7: '#f7f7f7', // Primary hover
  $8: '#363D47', // Secondary hover
  $9: '#ffffff', // Accent color text
};

export const colorSchemeAtom = atomWithStorage('colorScheme', $1);

export function useColorScheme() {
  const [colorScheme] = useAtom(colorSchemeAtom);

  return colorScheme;
}
