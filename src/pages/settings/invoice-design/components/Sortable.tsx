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

interface Props {
  cardTitle: string;
}

export function Sortable(props: Props) {
  const [t] = useTranslation();

  const options = [
    { value: 'name', label: t('name') },
    { value: 'number', label: t('number') },
    { value: 'vat_number', label: t('vat_number') },
  ];

  return (
    <Card title={props.cardTitle}>
      <Element leftSide={t('fields')}>
        <Select isMulti name="colors" options={options} />
      </Element>
    </Card>
  );
}
