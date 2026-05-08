/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Native `<input type="number">` for CSS lengths stored as `${n}px`.
 * Avoids InputField + DebounceInput (blur-only updates unless changeOverride).
 */

import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

/** Strip optional `px`; show bare integer for the number input. */
export function pxValueToDisplay(value: string | undefined): string {
  if (value == null || value === '') {
    return '';
  }
  const s = String(value).trim();
  const fromPx = s.match(/^(\d+(?:\.\d+)?)\s*px\s*$/i);
  if (fromPx) {
    return String(Math.round(Number(fromPx[1])));
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? String(Math.round(n)) : '';
}

/** Parse typed digits → `${n}px`, or `undefined` when cleared / invalid. */
export function displayToPxValue(display: string): string | undefined {
  const s = display.trim();
  if (s === '') {
    return undefined;
  }
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n) || n < 0) {
    return undefined;
  }
  const clamped = Math.min(9999, Math.max(0, Math.round(n)));
  return `${clamped}px`;
}

/** Merge `${n}px` onto block properties, or remove the key when `undefined`. */
export function mergePxOrOmit<P extends Record<string, unknown>>(
  properties: P,
  key: string,
  px: string | undefined
): P {
  if (px === undefined) {
    const next = { ...properties };
    delete next[key];
    return next as P;
  }
  return { ...properties, [key]: px } as P;
}

interface DesignerPxNumberInputProps {
  label: string;
  /** Stored value e.g. `14px` */
  value: string | undefined;
  /** Receives normalized `${n}px` or `undefined` when cleared */
  onChange: (normalizedPx: string | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Show “Use default” to clear (same pattern as TextInput resettable) */
  resettable?: boolean;
}

export function DesignerPxNumberInput({
  label,
  value,
  onChange,
  placeholder = '0',
  min = 0,
  max = 9999,
  step = 1,
  resettable,
}: DesignerPxNumberInputProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const reactSettings = useReactSettings({ overwrite: false });
  const showReset =
    resettable && value !== undefined && value !== null && value !== '';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          className="block text-sm font-medium"
          style={{ color: colors.$3 }}
        >
          {label}
        </label>
        {showReset && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs underline transition-colors"
            style={{ color: colors.$17 }}
            title={t('reset') || 'Reset'}
          >
            {t('use_default') || 'Use default'}
          </button>
        )}
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className={classNames(
          'w-full py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-0',
          {
            border: true,
            'border-[#09090B26] focus:border-black': !reactSettings.dark_mode,
            'border-[#1f2e41] focus:border-white': reactSettings.dark_mode,
          }
        )}
        style={{
          backgroundColor: colors.$1,
          color: colors.$3,
        }}
        placeholder={placeholder}
        value={pxValueToDisplay(value)}
        onChange={(e) => {
          onChange(displayToPxValue(e.target.value));
        }}
      />
    </div>
  );
}
