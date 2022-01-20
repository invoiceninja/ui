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
import { InputField, SelectField } from '@invoiceninja/forms';
import { useTranslation } from 'react-i18next';

export function Details() {
  const [t] = useTranslation();

  return (
    <Card className="col-span-12 xl:col-span-6" title={t('details')}>
      <Element leftSide={t('name')}>
        <InputField id="name" />
      </Element>

      <Element leftSide={t('number')}>
        <InputField id="number" />
      </Element>

      <Element leftSide={t('group')}>
        <SelectField />
      </Element>

      <Element leftSide={t('user')}>
        <SelectField />
      </Element>

      <Element leftSide={t('id_number')}>
        <InputField id="id_number" />
      </Element>

      <Element leftSide={t('vat_number')}>
        <InputField id="vat_number" />
      </Element>

      <Element leftSide={t('website')}>
        <InputField id="website" />
      </Element>

      <Element leftSide={t('phone')}>
        <InputField id="phone" />
      </Element>
    </Card>
  );
}
