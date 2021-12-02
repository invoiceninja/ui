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

export function Password() {
  const [t] = useTranslation();

  return (
    <Card withSaveButton title={t('password')}>
      <Element leftSide={t('current_password')}>
        <InputField id="password" type="password" />
      </Element>

      <div className="my-6"></div>

      <Element leftSide={t('new_password')}>
        <InputField id="password" type="password" />
      </Element>
      <Element leftSide={t('confirm_password')}>
        <InputField id="password" type="password" />
      </Element>
    </Card>
  );
}
