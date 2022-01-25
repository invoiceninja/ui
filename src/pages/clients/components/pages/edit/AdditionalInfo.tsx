/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Tab } from '@headlessui/react';
import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { TabGroup } from 'components/TabGroup';
import { useTranslation } from 'react-i18next';

export function AdditionalInfo() {
  const [t] = useTranslation();

  return (
    <Card className="mt-4" title={t('additional_info')}>
      <TabGroup
        className="px-5"
        tabs={[t('settings'), t('notes'), t('classify')]}
      >
        <Tab.Panel>
          <Element leftSide={t('currency')}>
            <SelectField />
          </Element>

          <Element leftSide={t('language')}>
            <InputField id="language" />
          </Element>

          <Element leftSide={t('payment_terms')}>
            <InputField id="invoice_payment_terms" />
          </Element>

          <Element leftSide={t('quote_valid_until')}>
            <InputField id="quote_valid_until" />
          </Element>

          <Element leftSide={t('task_rate')}>
            <InputField id="task_rate" />
          </Element>

          <Element leftSide={t('send_reminders')}>
            <SelectField>
              <option value=""></option>
              <option value="enabled">{t('enabled')}</option>
              <option value="disabled">{t('disabled')}</option>
            </SelectField>
          </Element>
        </Tab.Panel>

        <Tab.Panel></Tab.Panel>
        <Tab.Panel></Tab.Panel>
      </TabGroup>
    </Card>
  );
}
