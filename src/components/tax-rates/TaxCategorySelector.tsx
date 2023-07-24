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
import { ComboboxStatic, Entry } from '../forms/Combobox';

interface Props {
  value: string | null;
  label?: string;
  onChange: (taxCategory: Entry) => unknown;
}

export function useTaxCategories() {
  const [t] = useTranslation();

  const taxCategories: Entry[] = [
    {
      id: '1',
      value: '1',
      label: t('physical_goods'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '2',
      value: '2',
      label: t('services'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '3',
      value: '3',
      label: t('digital_products'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '4',
      value: '4',
      label: t('shipping'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '5',
      value: '5',
      label: t('tax_exempt'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '6',
      value: '6',
      label: t('reduced_tax'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '7',
      value: '7',
      label: t('override_tax'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '8',
      value: '8',
      label: t('zero_rated'),
      resource: null,
      eventType: 'external',
    },
    {
      id: '9',
      value: '9',
      label: t('reverse_tax'),
      resource: null,
      eventType: 'external',
    },
  ];

  return taxCategories;
}

export function TaxCategorySelector({ value, label, onChange }: Props) {
  const taxCategories = useTaxCategories();

  return (
    <ComboboxStatic
      inputOptions={{
        value,
        label,
      }}
      entries={taxCategories}
      entryOptions={{
        id: 'id',
        value: 'id',
        label: 'label',
      }}
      onChange={onChange}
      onEmptyValues={() => null}
    />
  );
}
