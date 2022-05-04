/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TaxRate } from 'common/interfaces/tax-rate';
import { DebouncedCombobox, Record } from 'components/forms/DebouncedCombobox';
import { TaxCreate } from 'pages/invoices/common/components/TaxCreate';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  defaultValue?: string | number | boolean;
  clearButton?: boolean;
  className?: string;
  inputLabel?: string;
  onChange?: (value: Record<TaxRate>) => unknown;
  onClearButtonClick?: () => unknown;
  onTaxCreated?: (taxRate: TaxRate) => unknown;
  onInputFocus?: () => unknown;
}

export function TaxRateSelector(props: Props) {
  const [t] = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <DebouncedCombobox
        inputLabel={props.inputLabel}
        endpoint="/api/v1/tax_rates"
        label={t('tax')}
        formatLabel={(resource: TaxRate) =>
          `${resource.name} ${resource.rate}%`
        }
        onChange={(record: Record<TaxRate>) =>
          props.onChange && props.onChange(record)
        }
        value="rate"
        defaultValue={props.defaultValue}
        clearButton={props.clearButton}
        onClearButtonClick={props.onClearButtonClick}
        actionLabel={t('create_tax_rate')}
        onActionClick={() => setIsModalOpen(true)}
        className={props.className}
        onInputFocus={props.onInputFocus}
      />

      <TaxCreate
        isVisible={isModalOpen}
        onClose={setIsModalOpen}
        onTaxCreated={props.onTaxCreated}
      />
    </>
  );
}
