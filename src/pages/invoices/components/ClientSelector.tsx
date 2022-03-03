/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputLabel } from '@invoiceninja/forms';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ClientContactSelector } from './ClientContactSelector';
import { ClientCreate } from './ClientCreate';

interface Props {
  readonly?: boolean;
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const invoice = useCurrentInvoice();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <InputLabel>{t('client')}</InputLabel>
        {!props.readonly && <ClientCreate />}
      </div>

      <DebouncedCombobox
        endpoint="/api/v1/clients"
        label="display_name"
        onChange={(value) =>
          dispatch(
            setCurrentInvoiceProperty({
              property: 'client_id',
              value: value.value,
            })
          )
        }
        defaultValue={invoice?.client_id}
        disabled={props.readonly}
      />

      <ClientContactSelector />
    </Card>
  );
}
