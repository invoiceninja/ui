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
import { generatePath } from 'react-router';
import { Card, Element } from '../../../../components/cards';
import { SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function SecuritySettings() {
  const [t] = useTranslation();

  return (
    <Card title={t('security_settings')}>
      <Element leftSide={t('password_timeout')}>
        <SelectField>
          <option value="7_days">
            {generatePath(t('count_days'), { count: '7' })}
          </option>
        </SelectField>
      </Element>

      <Element leftSide={t('web_session_timeout')}>
        <SelectField>
          <option value="7_days">
            {generatePath(t('count_days'), { count: '7' })}
          </option>
        </SelectField>
      </Element>

      <Element leftSide={t('require_password_with_social_login')}>
        <Toggle />
      </Element>
    </Card>
  );
}
