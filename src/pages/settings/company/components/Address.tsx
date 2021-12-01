/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { InputField, SelectField } from '../../../../components/forms';

export function Address() {
  const [t] = useTranslation();

  return (
    <Card title={t('address')}>
      <Element leftSide={t('address1')}>
        <InputField id="address1" />
      </Element>
      <Element leftSide={t('address2')}>
        <InputField id="address2" />
      </Element>
      <Element leftSide={t('city')}>
        <InputField id="city" />
      </Element>
      <Element leftSide={t('state')}>
        <InputField id="state" />
      </Element>
      <Element leftSide={t('postal_code')}>
        <InputField id="postal_code" />
      </Element>
      <Element leftSide={t('country')}>
        <SelectField>
          <option>Bosnia and Herzegovina</option>
        </SelectField>
      </Element>
    </Card>
  );
}
