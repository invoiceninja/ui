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
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: TextInputProps) {
  return (
    <InputField
      label={label}
      type={type}
      value={value || ''}
      onValueChange={(val) => onChange(val)}
      placeholder={placeholder}
    />
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
export function LineHeightInput({ label, value, onChange }: BaseInputProps) {
  const [t] = useTranslation();

  return (
    <SelectField
      label={label || String(t('line_height'))}
      value={value || '1.5'}
      onValueChange={(val) => onChange(val)}
    >
      <option value="1">1.0</option>
      <option value="1.2">1.2</option>
      <option value="1.5">1.5</option>
      <option value="1.8">1.8</option>
      <option value="2">2.0</option>
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
