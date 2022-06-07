/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '@invoiceninja/cards';
import { InputLabel } from '@invoiceninja/forms';
import { DebouncedCombobox } from 'components/forms/DebouncedCombobox';
import { ClientCreate } from 'pages/invoices/common/components/ClientCreate';
import { useTranslation } from 'react-i18next';
import { useCurrentQuote } from '../hooks/useCurrentQuote';
import { useSetCurrentQuoteProperty } from '../hooks/useSetCurrentQuoteProperty';
import { ClientContactSelector } from './ClientContactSelector';

interface Props {
  readonly?: boolean;
}

export function ClientSelector(props: Props) {
  const [t] = useTranslation();

  const quote = useCurrentQuote();
  const onChange = useSetCurrentQuoteProperty();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <InputLabel>{t('client')}</InputLabel>
        {!props.readonly && !quote?.client_id && (
          <ClientCreate
            onClientCreated={(client) => onChange('client_id', client.id)}
          />
        )}
      </div>

      <DebouncedCombobox
        endpoint="/api/v1/clients"
        label="display_name"
        onChange={(value) => onChange('client_id', value.value)}
        defaultValue={quote?.client_id}
        disabled={props.readonly}
        clearButton={Boolean(quote?.client_id)}
        onClearButtonClick={() => onChange('client_id', '')}
        queryAdditional
      />

      <ClientContactSelector />
    </Card>
  );
}
