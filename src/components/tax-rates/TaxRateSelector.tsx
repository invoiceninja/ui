/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TaxRate } from '$app/common/interfaces/tax-rate';
import { TaxCreate } from '$app/pages/invoices/common/components/TaxCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ComboboxAsync, Entry } from '../forms/Combobox';
import { endpoint } from '$app/common/helpers';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  onChange?: (value: Entry<TaxRate>) => unknown;
  onClearButtonClick?: () => unknown;
  onTaxCreated?: (taxRate: TaxRate) => unknown;
}

export function TaxRateSelector(props: Props) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ComboboxAsync<TaxRate>
        inputOptions={{
          value: props.defaultValue ?? null,
        }}
        endpoint={endpoint('/api/v1/tax_rates?status=active')}
        onChange={(taxRate) => props.onChange && props.onChange(taxRate)}
        action={{
          label: t('create_tax_rate'),
          onClick: () => setIsModalOpen(true),
          visible: true,
        }}
        entryOptions={{
          id: 'id',
          value: 'name',
          label: 'name',
          inputLabelFn: (taxRate) =>
            taxRate ? `${taxRate.name} ${taxRate.rate}%` : '',
          dropdownLabelFn: (taxRate) => `${taxRate.name} ${taxRate.rate}%`,
        }}
        onDismiss={props.onClearButtonClick}
      />

      <TaxCreate
        isVisible={isModalOpen}
        onClose={setIsModalOpen}
        onTaxCreated={props.onTaxCreated}
      />
    </>
  );
}
