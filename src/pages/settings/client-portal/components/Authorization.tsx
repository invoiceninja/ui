/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { Divider } from 'components/cards/Divider';
import Toggle from 'components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from 'pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';

export function Authorization() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <Card title={t('authorization')}>
      <Element
        leftSide={t('enable_portal_password')}
        leftSideHelp={t('enable_portal_password_help')}
      >
        <Toggle
          value={company?.settings.enable_client_portal_password}
          onValueChange={(value) =>
            handleChange('settings.enable_client_portal_password', value)
          }
        />
      </Element>

      <Element
        leftSide={t('show_accept_invoice_terms')}
        leftSideHelp={t('show_accept_invoice_terms_help')}
      >
        <Toggle
          value={company?.settings.show_accept_invoice_terms}
          onValueChange={(value) =>
            handleChange('settings.show_accept_invoice_terms', value)
          }
        />
      </Element>

      <Element
        leftSide={t('show_accept_quote_terms')}
        leftSideHelp={t('show_accept_quote_terms_help')}
      >
        <Toggle
          value={company?.settings.show_accept_quote_terms}
          onValueChange={(value) =>
            handleChange('settings.show_accept_quote_terms', value)
          }
        />
      </Element>

      <Divider />

      <Element
        leftSide={t('require_invoice_signature')}
        leftSideHelp={t('require_invoice_signature_help')}
      >
        <Toggle
          value={company?.settings.require_invoice_signature}
          onValueChange={(value) =>
            handleChange('settings.require_invoice_signature', value)
          }
        />
      </Element>

      <Element
        leftSide={t('require_quote_signature')}
        leftSideHelp={t('require_quote_signature_help')}
      >
        <Toggle
          value={company?.settings.require_quote_signature}
          onValueChange={(value) =>
            handleChange('settings.require_quote_signature', value)
          }
        />
      </Element>

      <Element
        leftSide={t('signature_on_pdf')}
        leftSideHelp={t('signature_on_pdf_help')}
      >
        <Toggle
          value={company?.settings.signature_on_pdf}
          onValueChange={(value) =>
            handleChange('settings.signature_on_pdf', value)
          }
        />
      </Element>
    </Card>
  );
}
