/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import Select from 'react-select';

export function ClientDetails() {
  const [t] = useTranslation();

  const options = [
    { value: 'name', label: t('name') },
    { value: 'number', label: t('number') },
    { value: 'vat_number', label: t('vat_number') },
  ];

  const state = {
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'],
  };

  return (
    <Card title={t('client_details')}>
      <Element leftSide={t('fields')}>
        <Select isMulti name="colors" options={options} />
      </Element>
    </Card>
  );
}
