/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { endpoint } from 'common/helpers';
import Toggle from 'components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Props {
  blobUrl: string;
  onHandleDeliveryNote: (url: string, isDeliveryNote: boolean) => unknown;
}

export function Actions(props: Props) {
  const [t] = useTranslation();
  const { id } = useParams();

  const handleDeliveryNoteChange = (value: boolean) =>
    value
      ? props.onHandleDeliveryNote(
          endpoint('/api/v1/invoices/:id/delivery_note?per_page=999999', {
            id,
          }),
          true
        )
      : props.onHandleDeliveryNote(props.blobUrl, false);

  return (
    <>
      <span className="inline-flex items-center mr-4">
        <Toggle
          label={t('delivery_note')}
          onChange={handleDeliveryNoteChange}
        />
      </span>

      <Button type="secondary">{t('email')}</Button>

      <Button type="secondary" onClick={() => window.open(props.blobUrl)}>
        {t('download')}
      </Button>

      <Button type="secondary">{t('close')}</Button>
    </>
  );
}
