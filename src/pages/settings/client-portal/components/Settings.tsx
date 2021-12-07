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
import {
  InputField,
  SelectField,
  Textarea,
} from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function Settings() {
  const [t] = useTranslation();

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('portal_mode')}>
        <SelectField>
          <option value="subdomain">{t('subdomain')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('subdomain')}>
        <InputField id="subdomain" />
      </Element>

      <div className="pt-4 border-b"></div>

      <Element className="mt-4" leftSide={t('client_portal')}>
        <Toggle />
      </Element>

      <Element leftSide={t('tasks')}>
        <Toggle />
      </Element>

      <Element
        leftSide={t('document_upload')}
        leftSideHelp={t('document_upload_help')}
      >
        <Toggle />
      </Element>

      <Element leftSide={t('storefront')} leftSideHelp={t('storefront_help')}>
        <Toggle />
      </Element>

      <div className="pt-4 border-b"></div>

      <Element className="mt-4" leftSide={t('terms_of_service')}>
        <Textarea />
      </Element>

      <Element leftSide={t('privacy_policy')}>
        <Textarea />
      </Element>
    </Card>
  );
}
