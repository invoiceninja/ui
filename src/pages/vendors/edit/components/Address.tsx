/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

type Props = { data?: any };

export function Address(props: Props) {
  const [t] = useTranslation();

  return (
    <Card title={t('address')} className="mb-5">
      <Element leftSide={t('address1')}>
        <InputField value={props.data.address1} />
      </Element>
      <Element leftSide={t('address2')}>
        <InputField value={props.data.address2} />
      </Element>
      <Element leftSide={t('city')}>
        <InputField value={props.data.city} />
      </Element>
      <Element leftSide={t('state')}>
        <InputField value={props.data.state} />
      </Element>
      <Element leftSide={t('postal_code')}>
        <InputField value={props.data.postal_code} />
      </Element>
      <Element leftSide={t('country_id')}>
        <InputField value={props.data.country_id} />
      </Element>
    </Card>
  );
}
