/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../components/cards';
import { InputField, SelectField, Textarea } from '../../../components/forms';
import Toggle from '../../../components/forms/Toggle';
import { Settings } from '../../../components/layouts/Settings';

export function EmailSettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'email_settings'
    )}`;
  });

  return (
    <Settings title={t('email_settings')}>
      <Card title={t('settings')}>
        <Element leftSide={t('send_from_gmail')}>
          <Toggle />
        </Element>

        <div className="pt-4 border-b"></div>

        <Element className="mt-4" leftSide={t('from_name')}>
          <InputField id="from_name" />
        </Element>

        <Element leftSide={t('reply_to_name')}>
          <InputField id="reply_to_name" />
        </Element>

        <Element leftSide={t('reply_to_email')}>
          <InputField id="reply_to_email" />
        </Element>

        <Element leftSide={t('bcc_email')}>
          <InputField id="bcc_email" />
        </Element>

        <Element leftSide={t('send_time')}>
          <SelectField>
            <option value="7am">7 AM</option>
          </SelectField>
        </Element>

        <div className="pt-4 border-b"></div>

        <Element className="mt-4" leftSide={t('email_design')}>
          <SelectField>
            <option value="plain">{t('plain')}</option>
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="custom">{t('custom')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('signature')}>
          <Textarea />
        </Element>

        <div className="pt-4 border-b"></div>

        <Element className="mt-4" leftSide={t('attach_pdf')}>
          <Toggle />
        </Element>

        <Element leftSide={t('attach_documents')}>
          <Toggle />
        </Element>

        <Element leftSide={t('attach_ubl')}>
          <Toggle />
        </Element>
      </Card>
    </Settings>
  );
}
