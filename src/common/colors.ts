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
import { useEffect } from 'react';
import { useReactSettings } from './hooks/useReactSettings';

// export const $1 = {
//   name: 'invoiceninja.dark',
//   $0: 'dark',
//   $1: '#182433',
//   $2: '#151f2c',
//   $3: '#ffffff',
//   $4: '#1f2e41',
//   $5: '#1f2e41',
//   $6: '#151f2c',
//   $7: '#151f2c',
//   $8: '#1f2e41',
//   $9: '#ffffff',
// };

export const $1 = {
  name: 'invoiceninja.dark',
  $0: 'dark',
  $1: '#121212',
  $2: '#121212',
  $3: 'rgba(255, 255, 255, 0.87)',
  $4: '#1f2e41',
  $5: '#1f2e41',
  $6: '#121212',
  $7: '#151f2c',
  $8: '#1f2e41',
  $9: '#ffffff',
  $10: 0.87, // High emphasis text
  $11: 0.6, // Medium emphasis text
  $12: 0.38, // Disabled text
};

export const $2 = {
  name: 'invoiceninja.light',
  $0: 'light',
  $1: '#ffffff', // Primary background
  $2: '#f7f7f7', // Secondary background
  $3: '#2a303d', // Primary text
  $4: '#f7f7f7', // Primary border
  $5: '#d1d5db', // Secondary border (sidebar)
  $6: '#242930', // Secondary background
  $7: '#f7f7f7', // Primary hover
  $8: '#363D47', // Secondary hover
  $9: '#ffffff', // Accent color text
  $10: 1, // High emphasis text
  $11: 0.8, // Secondary text opacity
  $12: 0.5, // Disabled text opacity
};

export const colorSchemeAtom = atomWithStorage('colorScheme', $2);

export function useColorScheme() {
  const reactSettings = useReactSettings({ overwrite: false });

  const [colorScheme, setColorScheme] = useAtom(colorSchemeAtom);

  useEffect(() => {
    if (reactSettings) {
      reactSettings.dark_mode ? setColorScheme($1) : setColorScheme($2);
    }
  }, [reactSettings?.dark_mode]);

  return colorScheme;
}
