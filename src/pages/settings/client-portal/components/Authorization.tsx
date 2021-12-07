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

export function Authorization() {
  const [t] = useTranslation();

  return (
    <Card title={t('authorization')}>
      <Element
        leftSide={t('enable_portal_password')}
        leftSideHelp={t('enable_portal_password_help')}
      >
        <Toggle />
      </Element>

      <div className="mt-4 border-b"></div>

      <Element
        className="mt-4"
        leftSide={t('show_accept_invoice_terms')}
        leftSideHelp={t('show_accept_invoice_terms_help')}
      >
        <Toggle />
      </Element>

      <Element
        leftSide={t('show_accept_quote_terms')}
        leftSideHelp={t('show_accept_quote_terms_help')}
      >
        <Toggle />
      </Element>

      <div className="mt-4 border-b"></div>

      <Element
        className="mt-4"
        leftSide={t('require_invoice_signature')}
        leftSideHelp={t('require_invoice_signature_help')}
      >
        <Toggle />
      </Element>

      <Element
        leftSide={t('require_quote_signature')}
        leftSideHelp={t('require_quote_signature_help')}
      >
        <Toggle />
      </Element>

      <Element
        leftSide={t('signature_on_pdf')}
        leftSideHelp={t('signature_on_pdf_help')}
      >
        <Toggle />
      </Element>
    </Card>
  );
}
