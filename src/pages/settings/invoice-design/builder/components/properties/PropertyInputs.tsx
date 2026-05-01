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
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import { InputField } from '$app/components/forms/InputField';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Checkbox } from '$app/components/forms/Checkbox';
import { SelectField } from '$app/components/forms/SelectField';
import { Button } from '$app/components/forms/Button';
import { useColorScheme } from '$app/common/colors';

interface BaseInputProps {
  label?: string;
  value: any;
  onChange: (value: any) => void;
}

/**
 * Font Size Input - Grid of size buttons
 */
interface FontSizeInputProps extends BaseInputProps {
  sizes?: string[];
}

export function FontSizeInput({
  label,
  value,
  onChange,
  sizes = ['10px', '12px', '14px', '16px', '18px', '20px'],
}: FontSizeInputProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const isInherited = !value;

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            className="block text-sm font-medium"
            style={{ color: colors.$3 }}
          >
            {label}
          </label>
          {!isInherited && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs underline transition-colors"
              style={{ color: colors.$17 }}
              title={t('reset') || 'Reset to document default'}
            >
              {t('use_default') || 'Use default'}
            </button>
          )}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => (
          <Button
            key={size}
            behavior="button"
            type={value === size ? 'primary' : 'secondary'}
            onClick={() => onChange(size)}
            className="px-3 py-2 text-sm"
          >
            {size}
          </Button>
        ))}
      </div>
      {isInherited && (
        <div className="text-xs mt-1.5" style={{ color: colors.$17 }}>
          {t('inheriting_from_document_default') || 'Inheriting from document default'}
        </div>
      )}
    </div>
  );
}

/**
 * Text Input - Using existing InputField component
 */
interface TextInputProps extends BaseInputProps {
  placeholder?: string;
  type?: 'text' | 'number';
  hint?: string;
  /**
   * When true and `value` is non-empty, render a "Use default" CTA next to
   * the label that clears the value (so the cascade falls back to globals).
   */
  resettable?: boolean;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  resettable,
}: TextInputProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const showReset = resettable && value !== undefined && value !== null && value !== '';

  return (
    <div>
      {label && (
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
              onClick={() => onChange('')}
              className="text-xs underline transition-colors"
              style={{ color: colors.$17 }}
              title={t('reset') || 'Reset to document default'}
            >
              {t('use_default') || 'Use default'}
            </button>
          )}
        </div>
      )}
      <InputField
        type={type}
        value={value || ''}
        onValueChange={(val) => onChange(val)}
        placeholder={placeholder}
      />
    </div>
  );
}

/**
 * Color Input - Using existing ColorPicker component
 */
interface ColorInputProps extends BaseInputProps {
  defaultValue?: string;
}

export function ColorInput({
  label,
  value,
  onChange,
  defaultValue = '#000000',
}: ColorInputProps) {
  const colors = useColorScheme();
  const currentValue = value || defaultValue;

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.$3 }}
        >
          {label}
        </label>
      )}
      <ColorPicker
        value={currentValue}
        onValueChange={(color) => onChange(color)}
      />
    </div>
  );
}

/**
 * Alignment Input - Left/Center/Right buttons using Button component
 */
interface AlignmentInputProps extends BaseInputProps {
  options?: ('left' | 'center' | 'right')[];
}

export function AlignmentInput({
  label,
  value,
  onChange,
  options = ['left', 'center', 'right'],
}: AlignmentInputProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const icons = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
  };

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.$3 }}
        >
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {options.map((align) => {
          const Icon = icons[align];
          return (
            <Button
              key={align}
              behavior="button"
              type={value === align ? 'primary' : 'secondary'}
              onClick={() => onChange(align)}
              className="flex-1 flex items-center justify-center px-3 py-2"
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Font Style Input - Bold/Italic toggle buttons using Button component
 */
interface FontStyleInputProps {
  label?: string;
  fontWeight: string;
  fontStyle?: string;
  onFontWeightChange: (value: string) => void;
  onFontStyleChange?: (value: string) => void;
}

export function FontStyleInput({
  label,
  fontWeight,
  fontStyle = 'normal',
  onFontWeightChange,
  onFontStyleChange,
}: FontStyleInputProps) {
  const colors = useColorScheme();

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.$3 }}
        >
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <Button
          behavior="button"
          type={fontWeight === 'bold' ? 'primary' : 'secondary'}
          onClick={() =>
            onFontWeightChange(fontWeight === 'bold' ? 'normal' : 'bold')
          }
          className="flex-1 flex items-center justify-center px-3 py-2"
        >
          <Bold className="w-4 h-4" />
        </Button>
        {onFontStyleChange && (
          <Button
            behavior="button"
            type={fontStyle === 'italic' ? 'primary' : 'secondary'}
            onClick={() =>
              onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')
            }
            className="flex-1 flex items-center justify-center px-3 py-2"
          >
            <Italic className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Checkbox Input - Using existing Checkbox component
 */
interface CheckboxInputProps {
  id?: string;
  label?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function CheckboxInput({
  id,
  label,
  checked,
  onChange,
}: CheckboxInputProps) {
  return (
    <Checkbox
      id={id}
      label={label}
      checked={checked}
      onValueChange={(_value, isChecked) => onChange(isChecked ?? false)}
    />
  );
}

/**
 * Select Input - Using existing SelectField component
 */
interface SelectInputProps extends BaseInputProps {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
}: SelectInputProps) {
  return (
    <SelectField
      label={label}
      value={value}
      onValueChange={(val) => onChange(val)}
      placeholder={placeholder}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </SelectField>
  );
}

/**
 * Section Divider - Visual separator between sections
 */
interface SectionDividerProps {
  label?: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  const colors = useColorScheme();

  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" style={{ borderColor: colors.$24 }} />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span
            className="px-2 text-xs uppercase tracking-wider"
            style={{ backgroundColor: colors.$1, color: colors.$17 }}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Line Height Input - Using SelectField
 */
export const LINE_HEIGHT_DEFAULT = '1.5';

const LINE_HEIGHT_OPTIONS = [
  '1.0',
  '1.1',
  '1.2',
  '1.3',
  '1.4',
  '1.5',
  '1.6',
  '1.7',
  '1.8',
  '1.9',
  '2.0',
];

/** Normalise a stored value (e.g. '1', '1.20', '1.5') to a canonical option key. */
function normaliseLineHeight(raw: string | undefined): string {
  if (!raw) return LINE_HEIGHT_DEFAULT;
  const num = parseFloat(raw);
  if (!Number.isFinite(num)) return LINE_HEIGHT_DEFAULT;
  return num.toFixed(1);
}

export function LineHeightInput({ label, value, onChange }: BaseInputProps) {
  const [t] = useTranslation();

  const current = normaliseLineHeight(value);
  // If a saved value sits outside our standard options, surface it as a
  // bespoke option so the displayed selection always reflects the real value.
  const options = LINE_HEIGHT_OPTIONS.includes(current)
    ? LINE_HEIGHT_OPTIONS
    : [...LINE_HEIGHT_OPTIONS, current].sort(
        (a, b) => parseFloat(a) - parseFloat(b)
      );

  return (
    <SelectField
      label={label || String(t('line_height'))}
      value={current}
      onValueChange={(val) => onChange(val)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </SelectField>
  );
}

/**
 * Border Style Input - Using SelectField
 */
type BorderStyleInputProps = BaseInputProps;

export function BorderStyleInput({
  label,
  value,
  onChange,
}: BorderStyleInputProps) {
  const [t] = useTranslation();

  return (
    <SelectField
      label={label || String(t('border_style'))}
      value={value || 'solid'}
      onValueChange={(val) => onChange(val)}
    >
      <option value="solid">{t('solid')}</option>
      <option value="dashed">{t('dashed')}</option>
      <option value="dotted">{t('dotted')}</option>
      <option value="double">{t('double')}</option>
      <option value="none">{t('none')}</option>
    </SelectField>
  );
}

interface RangeSliderInputProps extends BaseInputProps {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function RangeSliderInput({
  label,
  value,
  onChange,
  min = 5,
  max = 100,
  step = 1,
  unit = '%',
}: RangeSliderInputProps) {
  const colors = useColorScheme();
  const numericValue = parseInt(value?.replace(/[^0-9]/g, '') || String(min), 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(`${newValue}${unit}`);
  };

  return (
    <div>
      {label && (
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: colors.$3 }}
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={handleChange}
          className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            backgroundColor: colors.$24,
            accentColor: colors.$3,
          }}
        />
        <span
          className="text-sm font-medium min-w-[3rem] text-right"
          style={{ color: colors.$3 }}
        >
          {numericValue}{unit}
        </span>
      </div>
    </div>
  );
}
