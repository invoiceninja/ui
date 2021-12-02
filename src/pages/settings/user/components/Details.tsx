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
import { InputField } from '../../../../components/forms';

export function Details() {
  const [t] = useTranslation();

  return (
    <Card title={t('details')}>
      <Element leftSide={t('first_name')}>
        <InputField id="first_name" />
      </Element>
      <Element leftSide={t('last_name')}>
        <InputField id="last_name" />
      </Element>
      <Element leftSide={t('email')}>
        <InputField id="email" type="email" />
      </Element>
      <Element leftSide={t('phone')}>
        <InputField id="phone" />
      </Element>
    </Card>
  );
}
