/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useHandleCurrentUserChangeProperty } from '$app/common/hooks/useHandleCurrentUserChange';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Modal } from '$app/components/Modal';
import { Element } from '$app/components/cards';
import { Button, InputField, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdDone } from 'react-icons/md';
import hexColorRegex from 'hex-color-regex';
import { toast } from '$app/common/helpers/toast/toast';
import { cloneDeep } from 'lodash';
import { useDispatch } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/user';

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

export type ThemeColorField =
  | 'status_color_theme'
  | 'sidebar_active_background_color'
  | 'sidebar_active_font_color'
  | 'sidebar_inactive_background_color'
  | 'sidebar_inactive_font_color'
  | 'invoice_header_background_color'
  | 'invoice_header_font_color'
  | 'table_alternate_row_background_color';

const DEFAULT_COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2f7dc3',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#9e9e9e',
  '#607d8b',
  '#616161',
  '#000000',
  '#57a6e4',
  '#324da1',
  '#4c9a1c',
  '#cd8900',
  '#b93700',
];

const CUSTOM_COLOR_FIELDS: ThemeColorField[] = [
  'sidebar_active_background_color',
  'sidebar_active_font_color',
  'sidebar_inactive_background_color',
  'sidebar_inactive_font_color',
  'invoice_header_background_color',
  'invoice_header_font_color',
  'table_alternate_row_background_color',
];

interface Theme {
  palette: string[];
}
const COLOR_THEMES: Record<ThemeKey, Theme> = {
  light: {
    palette: ['#58a6e4', '#324ea1', '#4c9a1d', '#cd8900', '#b83700'],
  },
  dark: {
    palette: ['#298aaa', '#0c45a3', '#407535', '#a87001', '#8b3c40'],
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

export function useIsColorValid() {
  return (color: string | undefined, fallBackColor: string) => {
    if (color) {
      if (hexColorRegex().test(color)) {
        return color;
      }
    }

    return fallBackColor;
  };
}

export function useStatusThemeColorScheme() {
  const reactSettings = useReactSettings();

  const colors = {
    $1: '',
    $2: '',
    $3: '',
    $4: '',
    $5: '',
  };

  COLOR_THEMES[
    reactSettings?.color_theme?.status_color_theme as ThemeKey
  ]?.palette?.forEach((value, index) => {
    colors[`$${index + 1}` as keyof typeof colors] = value;
  });

  return colors;
}

export function useThemeColorScheme() {
  const reactSettings = useReactSettings();

  const colors = {
    $1: '',
    $2: '',
    $3: '',
    $4: '',
    $5: '',
    $6: '',
    $7: '',
  };

  CUSTOM_COLOR_FIELDS.forEach((fieldKey, index) => {
    colors[`$${index + 1}` as keyof typeof colors] =
      reactSettings?.color_theme?.[fieldKey] || '';
  });

  return colors;
}

export function StatusColorTheme() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();

  const dispatch = useDispatch();
  const handleUserChange = useHandleCurrentUserChangeProperty();

  const handleExportColors = () => {
    let value = '';

    CUSTOM_COLOR_FIELDS.forEach((fieldKey) => {
      if (!value && reactSettings?.color_theme?.[fieldKey]) {
        value = reactSettings.color_theme[fieldKey];
      }

      if (value && reactSettings?.color_theme?.[fieldKey]) {
        value += ',' + reactSettings.color_theme[fieldKey];
      }
    });

    navigator.clipboard
      .writeText(value)
      .then(() => toast.success('copied_to_clipboard', { value: '' }));
  };

  const handleClearAll = () => {
    const updatedColorTheme = cloneDeep(reactSettings?.color_theme);

    if (updatedColorTheme) {
      CUSTOM_COLOR_FIELDS.forEach((fieldKey) => {
        updatedColorTheme[fieldKey] = '';
      });

      dispatch(
        updateChanges({
          property: 'company_user.react_settings.color_theme',
          value: updatedColorTheme,
        })
      );
    }
  };

  return (
    <>
      <Element leftSide={t('status_color_theme')}>
        <SelectField
          value={reactSettings?.color_theme?.status_color_theme || 'light'}
          onValueChange={(value) =>
            handleUserChange(
              'company_user.react_settings.color_theme.status_color_theme',
              value
            )
          }
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
                  ]?.palette?.map((paletteColor) => (
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

      {CUSTOM_COLOR_FIELDS.map((customField) => (
        <Element key={customField} leftSide={t(customField)}>
          <CustomColorField fieldKey={customField} />
        </Element>
      ))}

      <div className="flex justify-end px-6 mt-10 space-x-4">
        <Button behavior="button" type="secondary" onClick={handleClearAll}>
          {t('clear_all')}
        </Button>

        <Button behavior="button" onClick={handleExportColors}>
          {t('export_colors')}
        </Button>
      </div>
    </>
  );
}

interface Props {
  fieldKey: ThemeColorField;
}
export function CustomColorField(props: Props) {
  const { fieldKey } = props;

  const reactSettings = useReactSettings();

  const handleUserChange = useHandleCurrentUserChangeProperty();

  return (
    <div className="flex space-x-20">
      <InputField
        value={reactSettings?.color_theme?.[fieldKey] || ''}
        onValueChange={(value) =>
          handleUserChange(
            `company_user.react_settings.color_theme.${fieldKey}`,
            value
          )
        }
      />

      <DefaultColorPickerModal fieldKey={fieldKey} />
    </div>
  );
}

interface ModalProps {
  fieldKey: ThemeColorField;
}

export function DefaultColorPickerModal(props: ModalProps) {
  const [t] = useTranslation();

  const { fieldKey } = props;

  const reactSettings = useReactSettings();

  const isColorValid = useIsColorValid();
  const handleUserChange = useHandleCurrentUserChangeProperty();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (isModalOpen) {
      setSelectedColor(reactSettings?.color_theme?.[fieldKey] || '');
    }
  }, [isModalOpen]);

  return (
    <>
      <div className="flex items-center space-x-2">
        <div
          className="cursor-pointer hover:opacity-75"
          onClick={() => setIsModalOpen(true)}
          style={{
            width: 100,
            height: 38,
            backgroundColor: isColorValid(
              reactSettings?.color_theme?.[fieldKey],
              '#9e9e9e'
            ),
          }}
        />

        <Icon
          className="cursor-pointer"
          element={MdClose}
          size={26}
          onClick={() =>
            handleUserChange(
              `company_user.react_settings.color_theme.${fieldKey}`,
              ''
            )
          }
        />
      </div>

      <Modal
        title={t(fieldKey)}
        visible={isModalOpen}
        size="small"
        onClose={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-6 gap-x-2 gap-y-2">
            {DEFAULT_COLORS.map((color) => (
              <div
                key={color}
                className="relative cursor-pointer w-full hover:opacity-75"
                onClick={() => setSelectedColor(color)}
                style={{ height: 32, backgroundColor: color }}
              >
                {selectedColor === color && (
                  <Icon
                    className="absolute"
                    element={MdDone}
                    color="white"
                    size={25}
                    style={{ top: '0.3rem', left: '1.45rem' }}
                  />
                )}
              </div>
            ))}
          </div>

          <Button
            className="self-end"
            behavior="button"
            onClick={() => {
              handleUserChange(
                `company_user.react_settings.color_theme.${fieldKey}`,
                selectedColor
              );

              setIsModalOpen(false);
            }}
          >
            {t('done')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
