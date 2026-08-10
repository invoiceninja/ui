/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FieldConfig } from '../../types';
import { InvoiceData, replaceVariables } from '../../utils/variable-replacer';

export function buildFieldDisplayText(
  config: FieldConfig,
  data: InvoiceData
): string | null {
  const resolvedValue = replaceVariables(config.variable, data);

  if (
    config.hideIfEmpty !== false &&
    (!resolvedValue || resolvedValue.trim() === '')
  ) {
    return null;
  }

  return `${config.prefix || ''}${resolvedValue}${config.suffix || ''}`;
}

export function resolveItemValue(
  field: string,
  item: Record<string, unknown>
): string {
  // Extract field from item.field format (e.g., "item.product_key" -> "product_key")
  const fieldKey = field.startsWith('item.')
    ? field.replace('item.', '')
    : field;
  const value = item[fieldKey];

  if (typeof value === 'number') {
    if (
      fieldKey === 'cost' ||
      fieldKey === 'line_total' ||
      fieldKey === 'gross_line_total'
    ) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    return String(value);
  }
  return String(value || '');
}

/** Map text alignment to flexbox justify-content for image/logo blocks. */
export function resolveFlexJustifyContent(
  align: string | undefined
): 'flex-start' | 'flex-end' | 'center' {
  if (align === 'left') return 'flex-start';
  if (align === 'right') return 'flex-end';
  return 'center';
}
