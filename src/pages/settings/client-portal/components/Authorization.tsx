/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Divider } from '$app/components/cards/Divider';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';

export function Authorization() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const disableSettingsField = useDisableSettingsField();

  return (
    <Card title={t('authorization')}>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="enable_client_portal_password"
            labelElement={
              <SettingsLabel
                label={t('enable_portal_password')}
                helpLabel={t('enable_portal_password_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.enable_client_portal_password)}
          onValueChange={(value) =>
            handleChange('settings.enable_client_portal_password', value)
          }
          disabled={disableSettingsField('enable_client_portal_password')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="show_accept_invoice_terms"
            labelElement={
              <SettingsLabel
                label={t('show_accept_invoice_terms')}
                helpLabel={t('show_accept_invoice_terms_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.show_accept_invoice_terms)}
          onValueChange={(value) =>
            handleChange('settings.show_accept_invoice_terms', value)
          }
          disabled={disableSettingsField('show_accept_invoice_terms')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="show_accept_quote_terms"
            labelElement={
              <SettingsLabel
                label={t('show_accept_quote_terms')}
                helpLabel={t('show_accept_quote_terms_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.show_accept_quote_terms)}
          onValueChange={(value) =>
            handleChange('settings.show_accept_quote_terms', value)
          }
          disabled={disableSettingsField('show_accept_quote_terms')}
        />
      </Element>

      <Divider />

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="require_invoice_signature"
            labelElement={
              <SettingsLabel
                label={t('require_invoice_signature')}
                helpLabel={t('require_invoice_signature_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.require_invoice_signature)}
          onValueChange={(value) =>
            handleChange('settings.require_invoice_signature', value)
          }
          disabled={disableSettingsField('require_invoice_signature')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="require_quote_signature"
            labelElement={
              <SettingsLabel
                label={t('require_quote_signature')}
                helpLabel={t('require_quote_signature_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.require_quote_signature)}
          onValueChange={(value) =>
            handleChange('settings.require_quote_signature', value)
          }
          disabled={disableSettingsField('require_quote_signature')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="require_purchase_order_signature"
            labelElement={
              <SettingsLabel
                label={t('require_purchase_order_signature')}
                helpLabel={t('require_purchase_order_signature_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.require_purchase_order_signature)}
          onValueChange={(value) =>
            handleChange('settings.require_purchase_order_signature', value)
          }
          disabled={disableSettingsField('require_purchase_order_signature')}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="signature_on_pdf"
            labelElement={
              <SettingsLabel
                label={t('signature_on_pdf')}
                helpLabel={t('signature_on_pdf_help')}
              />
            }
            defaultValue={false}
          />
        }
      >
        <Toggle
          checked={Boolean(company?.settings.signature_on_pdf)}
          onValueChange={(value) =>
            handleChange('settings.signature_on_pdf', value)
          }
          disabled={disableSettingsField('signature_on_pdf')}
        />
      </Element>
    </Card>
  );
}
