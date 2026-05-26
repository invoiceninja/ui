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
import { useCustomField } from '$app/components/CustomField';

export function ClientShippingInfoBlockProperties({
  block,
  onChange,
}: PropertyEditorProps) {
  const [t] = useTranslation();
  const customField = useCustomField();

  const availableFields = useMemo(() => {
    const baseFields = [
      {
        id: 'shipping_address1',
        label: t('address1'),
        variable: '$client.shipping_address1',
      },
      {
        id: 'shipping_address2',
        label: t('address2'),
        variable: '$client.shipping_address2',
      },
      {
        id: 'shipping_city',
        label: t('city'),
        variable: '$client.shipping_city',
      },
      {
        id: 'shipping_state',
        label: t('state'),
        variable: '$client.shipping_state',
      },
      {
        id: 'shipping_postal_code',
        label: t('postal_code'),
        variable: '$client.shipping_postal_code',
      },
      {
        id: 'shipping_country',
        label: t('country'),
        variable: '$client.shipping_country',
      },
      {
        id: 'shipping_city_state_postal',
        label: t('city_state_postal'),
        variable: '$client.shipping_city_state_postal',
      },
      {
        id: 'postal_city_state',
        label: t('postal_city_state'),
        variable: '$client.shipping_postal_city_state',
      },
      {
        id: 'shipping_postal_city',
        label: t('postal_city'),
        variable: '$client.shipping_postal_city',
      },
    ];

    const customFieldConfigs: Array<{
      key: 'client1' | 'client2' | 'client3' | 'client4';
      id: string;
      variable: string;
      fallback: string;
    }> = [
      {
        key: 'client1',
        id: 'client1',
        variable: '$client.custom1',
        fallback: t('custom_field') + ' 1',
      },
      {
        key: 'client2',
        id: 'client2',
        variable: '$client.custom2',
        fallback: t('custom_field') + ' 2',
      },
      {
        key: 'client3',
        id: 'client3',
        variable: '$client.custom3',
        fallback: t('custom_field') + ' 3',
      },
      {
        key: 'client4',
        id: 'client4',
        variable: '$client.custom4',
        fallback: t('custom_field') + ' 4',
      },
    ];

    const customFields = customFieldConfigs
      .filter(({ key }) => customField(key).label())
      .map(({ key, id, variable, fallback }) => {
        const label = customField(key).label();
        return { id, label: label || fallback, variable };
      });

    return [...baseFields, ...customFields];
  }, [customField, t]);

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
