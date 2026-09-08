/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface MultiSelectDefaultValueOption {
  value: string;
}

export function getMultiSelectDefaultValueKey(
  defaultValue: MultiSelectDefaultValueOption[] | null | undefined
): string {
  return (defaultValue ?? [])
    .map((option) => option.value)
    .sort()
    .join(',');
}
