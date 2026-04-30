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
import { useMemo } from 'react';
import { PropertyEditorProps } from '../../types';
import { InfoBlockProperties } from './InfoBlockProperties';

export function ClientShippingInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();

  const availableFields = useMemo(
    () => [
      {
        id: 'shipping_address1',
        label: t('shipping_address1'),
        variable: '$client.shipping_address1',
      },
      {
        id: 'shipping_address2',
        label: t('shipping_address2'),
        variable: '$client.shipping_address2',
      },
      {
        id: 'shipping_city',
        label: t('shipping_city'),
        variable: '$client.shipping_city',
      },
      {
        id: 'shipping_state',
        label: t('shipping_state'),
        variable: '$client.shipping_state',
      },
      {
        id: 'shipping_postal_code',
        label: t('shipping_postal_code'),
        variable: '$client.shipping_postal_code',
      },
      {
        id: 'shipping_country',
        label: t('shipping_country'),
        variable: '$client.shipping_country',
      },
    ],
    [t]
  );

  return (
    <InfoBlockProperties
      block={block}
      onChange={onChange}
      availableFields={availableFields}
      title={String(t('ship_to'))}
      showTitleOption
    />
  );
}
