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
        <InputField></InputField>
      </Element>
      <Element leftSide={t('address2')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('city')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('state')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('postal_code')}>
        <InputField></InputField>
      </Element>
      <Element leftSide={t('country_id')}>
        <InputField></InputField>
      </Element>
    </Card>
  );
}
