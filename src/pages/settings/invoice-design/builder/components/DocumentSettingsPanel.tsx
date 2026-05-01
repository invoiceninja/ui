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
import { range } from 'lodash';
import { DocumentSettings } from '../types';
import {
  SectionDivider,
  CheckboxInput,
  SelectInput,
} from './properties/PropertyInputs';
import { useColorScheme } from '$app/common/colors';
import { FontSelect } from './properties/FontSelect';

interface DocumentSettingsPanelProps {
  settings: DocumentSettings;
  onChange: (settings: DocumentSettings) => void;
}

const PAGE_SIZE_OPTIONS = [
  { value: 'A5', label: 'A5' },
  { value: 'A4', label: 'A4' },
  { value: 'A3', label: 'A3' },
  { value: 'B5', label: 'B5' },
  { value: 'B4', label: 'B4' },
  { value: 'JIS-B5', label: 'JIS-B5' },
  { value: 'JIS-B4', label: 'JIS-B4' },
  { value: 'letter', label: 'Letter' },
  { value: 'legal', label: 'Legal' },
  { value: 'ledger', label: 'Ledger' },
];

const FONT_SIZE_OPTIONS = range(6, 41, 2).map((n) => ({
  value: String(n),
  label: `${n}px`,
}));

export function DocumentSettingsPanel({
  settings,
  onChange,
}: DocumentSettingsPanelProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const update = <K extends keyof DocumentSettings>(
    key: K,
    value: DocumentSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <SectionDivider label={t('page') || 'Page'} />

        <SelectInput
          label={t('page_layout') || 'Page Layout'}
          value={settings.pageLayout}
          onChange={(v) => update('pageLayout', v as 'portrait' | 'landscape')}
          options={[
            { value: 'portrait', label: t('portrait') || 'Portrait' },
            { value: 'landscape', label: t('landscape') || 'Landscape' },
          ]}
        />

        <SelectInput
          label={t('page_size') || 'Page Size'}
          value={settings.pageSize}
          onChange={(v) => update('pageSize', v)}
          options={PAGE_SIZE_OPTIONS}
        />
      </div>

      <div className="space-y-4">
        <SectionDivider label={t('typography') || 'Typography'} />

        <SelectInput
          label={t('font_size') || 'Global Font Size'}
          value={String(settings.globalFontSize)}
          onChange={(v) => update('globalFontSize', parseInt(v, 10) || 16)}
          options={FONT_SIZE_OPTIONS}
        />

        <FontSelect
          label={t('primary_font') || 'Primary Font'}
          value={settings.primaryFont}
          onChange={(v) => update('primaryFont', v)}
        />

        <FontSelect
          label={t('secondary_font') || 'Secondary Font'}
          value={settings.secondaryFont}
          onChange={(v) => update('secondaryFont', v)}
        />
      </div>

      <div className="space-y-4">
        <SectionDivider label={t('page_margin') || 'Page Margin (px)'} />

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ['pageMarginTop', t('top') || 'Top'],
              ['pageMarginRight', t('right') || 'Right'],
              ['pageMarginBottom', t('bottom') || 'Bottom'],
              ['pageMarginLeft', t('left') || 'Left'],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col text-xs gap-1"
              style={{ color: colors.$3 }}
            >
              <span>{label}</span>
              <input
                type="number"
                min={0}
                max={500}
                value={settings[key]}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  // Clamp to [0, 500]px — a single side larger than that pushes
                  // content off-page on every supported page size.
                  const clamped = Number.isFinite(raw)
                    ? Math.max(0, Math.min(500, raw))
                    : 0;
                  update(key, clamped);
                }}
                className="px-2 py-1 rounded border text-sm"
                style={{
                  borderColor: colors.$5,
                  background: colors.$1,
                  color: colors.$3,
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionDivider label={t('page_padding') || 'Page Padding (px)'} />

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ['pagePaddingTop', t('top') || 'Top'],
              ['pagePaddingRight', t('right') || 'Right'],
              ['pagePaddingBottom', t('bottom') || 'Bottom'],
              ['pagePaddingLeft', t('left') || 'Left'],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col text-xs gap-1"
              style={{ color: colors.$3 }}
            >
              <span>{label}</span>
              <input
                type="number"
                min={0}
                max={500}
                value={settings[key]}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  // Clamp to [0, 500]px — a single side larger than that pushes
                  // content off-page on every supported page size.
                  const clamped = Number.isFinite(raw)
                    ? Math.max(0, Math.min(500, raw))
                    : 0;
                  update(key, clamped);
                }}
                className="px-2 py-1 rounded border text-sm"
                style={{
                  borderColor: colors.$5,
                  background: colors.$1,
                  color: colors.$3,
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionDivider label={t('document_options') || 'Document Options'} />

        <CheckboxInput
          label={t('show_paid_stamp') || 'Show Paid Stamp'}
          checked={settings.showPaidStamp}
          onChange={(v) => update('showPaidStamp', v)}
        />

        <CheckboxInput
          label={t('show_shipping_address') || 'Show Shipping Address'}
          checked={settings.showShippingAddress}
          onChange={(v) => update('showShippingAddress', v)}
        />

        <CheckboxInput
          label={t('embed_documents') || 'Embed Images / Documents'}
          checked={settings.embedDocuments}
          onChange={(v) => update('embedDocuments', v)}
        />

        <CheckboxInput
          label={t('hide_empty_columns') || 'Hide Empty Columns'}
          checked={settings.hideEmptyColumns}
          onChange={(v) => update('hideEmptyColumns', v)}
        />

        <CheckboxInput
          label={t('page_numbering') || 'Page Numbering'}
          checked={settings.pageNumbering}
          onChange={(v) => update('pageNumbering', v)}
        />
      </div>
    </div>
  );
}
