/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { setCurrentInvoiceProperty } from 'common/stores/slices/invoices';
import { DebouncedSearch } from 'components/forms/DebouncedSearch';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function Actions() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (
    <div className="w-full flex justify-center my-6 space-x-4">
      <DebouncedSearch
        endpoint="/api/v1/designs"
        label="name"
        className="w-48"
        onChange={(payload) =>
          dispatch(
            setCurrentInvoiceProperty({
              property: 'design_id',
              value: payload.value,
            })
          )
        }
      />

      <Button type="secondary">{t('save_draft')}</Button>
      <Button type="secondary">{t('mark_sent')}</Button>
      <Button>{t('email_invoice')}</Button>
    </div>
  );
}
