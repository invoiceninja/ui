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
  sizes = ['10px', '12px', '14px', '16px', '18px', '20px']
}: FontSizeInputProps) {
  const [t] = useTranslation();

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`
              px-3 py-2 border rounded-md text-sm transition-all
              ${value === size
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Text Input - Simple text field with optional placeholder
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
  hint
}: TextInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        placeholder={placeholder}
      />
      {hint && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
    </div>
  );
}

/**
 * Color Input - Color picker with hex text input
 */
interface ColorInputProps extends BaseInputProps {
  defaultValue?: string;
}

export function ColorInput({ 
  label, 
  value, 
  onChange,
  defaultValue = '#000000'
}: ColorInputProps) {
  const currentValue = value || defaultValue;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="color"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
        />
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
        />
      </div>
    </div>
  );
}

/**
 * Alignment Input - Left/Center/Right buttons
 */
interface AlignmentInputProps extends BaseInputProps {
  options?: ('left' | 'center' | 'right')[];
}

export function AlignmentInput({ 
  label, 
  value, 
  onChange,
  options = ['left', 'center', 'right']
}: AlignmentInputProps) {
  const [t] = useTranslation();
  
  const icons = {
    left: AlignLeft,
    center: AlignCenter,
    right: AlignRight,
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {options.map((align) => {
          const Icon = icons[align];
          return (
            <button
              key={align}
              onClick={() => onChange(align)}
              className={`
                flex-1 flex items-center justify-center px-3 py-2 border rounded-md transition-all
                ${value === align
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              title={t(align)}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Font Style Input - Bold/Italic toggle buttons
 */
interface FontStyleInputProps {
  label?: string;
  fontWeight: string;
  fontStyle: string;
  onFontWeightChange: (value: string) => void;
  onFontStyleChange: (value: string) => void;
}

export function FontStyleInput({ 
  label, 
  fontWeight, 
  fontStyle,
  onFontWeightChange,
  onFontStyleChange
}: FontStyleInputProps) {
  const [t] = useTranslation();

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onFontWeightChange(fontWeight === 'bold' ? 'normal' : 'bold')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-md transition-all
            ${fontWeight === 'bold'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <Bold className="w-4 h-4" />
          {t('bold')}
        </button>

        <button
          onClick={() => onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-md transition-all
            ${fontStyle === 'italic'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <Italic className="w-4 h-4" />
          {t('italic')}
        </button>
      </div>
    </div>
  );
}

/**
 * Checkbox Input - Simple checkbox with label
 */
interface CheckboxInputProps extends BaseInputProps {
  id: string;
}

export function CheckboxInput({ 
  label, 
  value, 
  onChange,
  id
}: CheckboxInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
      />
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
}

/**
 * Select Input - Dropdown select
 */
interface SelectInputProps extends BaseInputProps {
  options: { value: string; label: string }[];
}

export function SelectInput({ 
  label, 
  value, 
  onChange,
  options
}: SelectInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Section Divider - Visual separator between property groups
 */
interface SectionDividerProps {
  label: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="pt-4 pb-2 border-t border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </h4>
    </div>
  );
}

/**
 * Property Group - Container for related properties
 */
interface PropertyGroupProps {
  label: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function PropertyGroup({ 
  label, 
  children,
  collapsible = false,
  defaultOpen = true
}: PropertyGroupProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
        {children}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        {label}
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

// Need to import React for PropertyGroup
import React from 'react';

/**
 * Padding Input - 4-value padding input (top, right, bottom, left)
 */
interface PaddingInputProps extends BaseInputProps {
  showIndividual?: boolean;
}

export function PaddingInput({ 
  label, 
  value, 
  onChange,
  showIndividual = false
}: PaddingInputProps) {
  const [t] = useTranslation();

  if (!showIndividual) {
    return (
      <TextInput
        label={label}
        value={value}
        onChange={onChange}
        placeholder="8px"
        hint={t('padding_hint')}
      />
    );
  }

  // Parse current padding value
  const parts = (value || '0px').split(' ');
  const top = parts[0] || '0px';
  const right = parts[1] || parts[0] || '0px';
  const bottom = parts[2] || parts[0] || '0px';
  const left = parts[3] || parts[1] || parts[0] || '0px';

  const updatePadding = (position: 'top' | 'right' | 'bottom' | 'left', newValue: string) => {
    const newPadding = {
      top: position === 'top' ? newValue : top,
      right: position === 'right' ? newValue : right,
      bottom: position === 'bottom' ? newValue : bottom,
      left: position === 'left' ? newValue : left,
    };
    onChange(`${newPadding.top} ${newPadding.right} ${newPadding.bottom} ${newPadding.left}`);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={top}
          onChange={(e) => updatePadding('top', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs text-center"
          placeholder={t('top')}
        />
        <input
          type="text"
          value={right}
          onChange={(e) => updatePadding('right', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs text-center"
          placeholder={t('right')}
        />
        <input
          type="text"
          value={bottom}
          onChange={(e) => updatePadding('bottom', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs text-center"
          placeholder={t('bottom')}
        />
        <input
          type="text"
          value={left}
          onChange={(e) => updatePadding('left', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-xs text-center"
          placeholder={t('left')}
        />
      </div>
    </div>
  );
}

/**
 * Line Height Input
 */
export function LineHeightInput({ label, value, onChange }: BaseInputProps) {
  const [t] = useTranslation();
  const presets = ['1', '1.25', '1.5', '1.75', '2'];

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value || '1.5'}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm"
          placeholder="1.5"
        />
        <div className="flex gap-1 flex-1">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`
                flex-1 px-2 py-2 border rounded-md text-xs transition-all
                ${value === preset
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Border Style Input
 */
interface BorderStyleInputProps extends BaseInputProps {
  showWidth?: boolean;
  showColor?: boolean;
  width?: string;
  color?: string;
  onWidthChange?: (value: string) => void;
  onColorChange?: (value: string) => void;
}

export function BorderStyleInput({ 
  label, 
  value, 
  onChange,
  showWidth = false,
  showColor = false,
  width,
  color,
  onWidthChange,
  onColorChange
}: BorderStyleInputProps) {
  const [t] = useTranslation();
  const styles = [
    { value: 'none', label: t('none') },
    { value: 'solid', label: t('solid') },
    { value: 'dashed', label: t('dashed') },
    { value: 'dotted', label: t('dotted') },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <select
          value={value || 'none'}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {styles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
        {showWidth && onWidthChange && (
          <input
            type="text"
            value={width || '1px'}
            onChange={(e) => onWidthChange(e.target.value)}
            className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="1px"
          />
        )}
      </div>
      {showColor && onColorChange && (
        <ColorInput
          value={color}
          onChange={onColorChange}
          defaultValue="#E5E7EB"
        />
      )}
    </div>
  );
}

