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
import { ClientResolver } from 'common/helpers/clients/client-resolver';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { injectBlankItemIntoCurrent } from 'common/stores/slices/invoices';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSetCurrentInvoiceProperty } from '../hooks/useSetCurrentInvoiceProperty';
import { ClientContactSelector } from './ClientContactSelector';
import { ClientCreate } from './ClientCreate';

interface Props {
  readonly?: boolean;
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();
  const invoice = useCurrentInvoice();
  const onChange = useSetCurrentInvoiceProperty();
  const dispatch = useDispatch();
  const resolveClient=new ClientResolver();
  const [clientName, setClientName] = useState('')
  useEffect(() => {
    if (invoice?.client_id && invoice?.line_items.length === 0) {
      dispatch(injectBlankItemIntoCurrent());
      resolveClient.find(invoice.client_id).then(client=>setClientName(client.display_name))
    }
  }, [invoice]);

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <InputLabel>{t('client')}</InputLabel>
        {!props.readonly && <ClientCreate />}
      </div>

      <DebouncedCombobox
        endpoint="/api/v1/clients"
        label="display_name"
        onChange={(value) => onChange('client_id', value.value)}
        defaultValue={invoice?.client_id}
        value={invoice?.client_id}
        disabled={props.readonly}
      />

      <ClientContactSelector />
    </Card>
  );
}
