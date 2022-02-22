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
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices';
import { DebouncedSearch } from 'components/forms/DebouncedSearch';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { CreateClient } from './CreateClient';

export function Client() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (
    <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
      <div className="flex items-center justify-between">
        <InputLabel>{t('client')}</InputLabel>
        <CreateClient />
      </div>

      <DebouncedSearch
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
      />
    </Card>
  );
}
