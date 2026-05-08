/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { CellTypography } from '../../types';
import { ColorInput, FontStyleInput } from './PropertyInputs';
import {
  DesignerPxNumberInput,
  pxValueToDisplay,
} from './DesignerPxNumberInput';

interface Props {
  heading: string;
  value: CellTypography | undefined;
  onChange: (next: CellTypography | undefined) => void;
  fontSizePlaceholder?: string;
  colorDefault?: string;
}

export function CellTypographyEditor({
  heading,
  value,
  onChange,
  fontSizePlaceholder,
  colorDefault,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const v = value || {};

  const set = (key: keyof CellTypography, next: string | undefined) => {
    const merged: CellTypography = { ...v, [key]: next || undefined };
    const allEmpty =
      !merged.fontSize &&
      !merged.fontWeight &&
      !merged.fontStyle &&
      !merged.color;
    onChange(allEmpty ? undefined : merged);
  };

  return (
    <div
      className="space-y-3 rounded-md p-3"
      style={{ border: `1px dashed ${colors.$24}` }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: colors.$17 }}
      >
        {heading}
      </div>

      <DesignerPxNumberInput
        label={String(t('font_size'))}
        value={v.fontSize}
        placeholder={
          fontSizePlaceholder
            ? pxValueToDisplay(fontSizePlaceholder) || '12'
            : '12'
        }
        resettable
        onChange={(px) => set('fontSize', px)}
      />

      <FontStyleInput
        label={String(t('font_style'))}
        fontWeight={v.fontWeight || 'normal'}
        fontStyle={v.fontStyle || 'normal'}
        onFontWeightChange={(next) =>
          set('fontWeight', next === 'normal' ? undefined : next)
        }
        onFontStyleChange={(next) =>
          set('fontStyle', next === 'normal' ? undefined : next)
        }
      />

      <ColorInput
        label={String(t('text_color'))}
        value={v.color || ''}
        onChange={(next) => set('color', next || undefined)}
        defaultValue={colorDefault}
      />
    </div>
  );
}
