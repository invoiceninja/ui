/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ThemeKey =
  | 'light'
  | 'dark'
  | 'cerulean'
  | 'cosmo'
  | 'cyborg'
  | 'darkly'
  | 'flatly'
  | 'journal'
  | 'litera'
  | 'lumen'
  | 'lux'
  | 'materia'
  | 'minty'
  | 'pulse'
  | 'sandstone'
  | 'simplex'
  | 'sketchy'
  | 'slate'
  | 'solar'
  | 'spacelab'
  | 'superhero'
  | 'united'
  | 'yeti';

interface Theme {
  palette: string[];
}
const COLOR_THEMES: Record<ThemeKey, Theme> = {
  light: {
    palette: ['#58a6e4', '#324ea1', '#4c9a1d', '#cd8900', '#b83700'],
  },
  dark: {
    palette: ['#298aaa', '#0c45a3', '#0c45a3', '#a87001', '#8b3c40'],
  },
  cerulean: {
    palette: ['#043c73', '#2fa3e7', '#74a739', '#dd5601', '#c71b22'],
  },
  cosmo: {
    palette: ['#9954bc', '#2680e3', '#3db616', '#ff7518', '#ff0039'],
  },
  cyborg: {
    palette: ['#9933cc', '#299fd6', '#76b400', '#ff8802', '#cc0100'],
  },
  darkly: {
    palette: ['#3498dc', '#375a7f', '#00bc8c', '#f29c13', '#e74b3c'],
  },
  flatly: {
    palette: ['#3498dc', '#2c3f51', '#12bd9d', '#f29c13', '#e74b3c'],
  },
  journal: {
    palette: ['#346599', '#eb6864', '#1fb34d', '#f6e524', '#f57900'],
  },
  litera: {
    palette: ['#1aa1b8', '#4581eb', '#00b975', '#f0ad4e', '#d9534f'],
  },
  lumen: {
    palette: ['#75caeb', '#158cba', '#29b72b', '#ff851b', '#ff4136'],
  },
  lux: {
    palette: ['#209bcf', '#1a1a1a', '#4ac073', '#f0ad4e', '#d9534f'],
  },
  materia: {
    palette: ['#9c27b0', '#2196f3', '#4dae51', '#ff9800', '#e61d23'],
  },
  minty: {
    palette: ['#6cc3d6', '#78c2ad', '#55cc9d', '#ffce67', '#ff7852'],
  },
  pulse: {
    palette: ['#009cdd', '#583196', '#0fba54', '#efa31b', '#fc3938'],
  },
  sandstone: {
    palette: ['#2aaae0', '#335d87', '#94c44b', '#f37c3d', '#d9534f'],
  },
  simplex: {
    palette: ['#009acf', '#d9230d', '#479505', '#d9831f', '#9c479f'],
  },
  sketchy: {
    palette: ['#1aa1b8', '#333333', '#29a645', '#ffc008', '#db3546'],
  },
  slate: {
    palette: ['#5ac0de', '#3a3f43', '#62c362', '#f89407', '#ee5f5a'],
  },
  solar: {
    palette: ['#258bd2', '#b58802', '#2aa198', '#cb4a15', '#d33582'],
  },
  spacelab: {
    palette: ['#3199f3', '#456e9c', '#3cb521', '#d47500', '#cd0300'],
  },
  superhero: {
    palette: ['#cd0300', '#df6919', '#5bb85b', '#f0ad4e', '#d9534f'],
  },
  united: {
    palette: ['#1aa1b8', '#e9551f', '#38b549', '#eeb83e', '#de382c'],
  },
  yeti: {
    palette: ['#5ac0de', '#008cba', '#44ab6a', '#ea9005', '#f14125'],
  },
};

export function StatusColorTheme() {
  const [t] = useTranslation();

  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('light');

  return (
    <Element leftSide={t('status_color_theme')}>
      <SelectField
        value={selectedTheme}
        onValueChange={(value) => setSelectedTheme(value as ThemeKey)}
        customSelector
      >
        {Object.keys(COLOR_THEMES).map((themeKey, index) => (
          <option key={index} value={themeKey}>
            <div className="flex w-full space-x-2">
              <span className="flex w-1/4 capitalize truncate">
                {t(themeKey)}
              </span>

              <div className="flex">
                {COLOR_THEMES[
                  themeKey as keyof typeof COLOR_THEMES
                ].palette.map((paletteColor) => (
                  <div
                    key={paletteColor}
                    style={{
                      backgroundColor: paletteColor,
                      width: 50,
                      height: 20,
                    }}
                  />
                ))}
              </div>
            </div>
          </option>
        ))}
      </SelectField>
    </Element>
  );
}
