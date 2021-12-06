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
import { InputField, SelectField } from '../../../../components/forms';

export function Clients() {
  const [t] = useTranslation();

  return (
    <Card title={t('clients')}>
      <Element
        leftSide={<InputField id="client1" placeholder={t('client_field')} />}
      >
        <SelectField>
          <option value="single_line">{t('single_line_text')}</option>
        </SelectField>
      </Element>

      <Element
        leftSide={<InputField id="client1" placeholder={t('client_field')} />}
      >
        <SelectField>
          <option value="single_line">{t('single_line_text')}</option>
        </SelectField>
      </Element>

      <Element
        leftSide={<InputField id="client1" placeholder={t('client_field')} />}
      >
        <SelectField>
          <option value="single_line">{t('single_line_text')}</option>
        </SelectField>
      </Element>

      <Element
        leftSide={<InputField id="client1" placeholder={t('client_field')} />}
      >
        <SelectField>
          <option value="single_line">{t('single_line_text')}</option>
        </SelectField>
      </Element>
    </Card>
  );
}
