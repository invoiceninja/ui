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
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';

export function Authorization() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  return (
    <Card title={t('authorization')}>
      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="enable_client_portal_password" />
            )}

            <div className="flex flex-col">
              <span>{t('enable_portal_password')}</span>
              <span className="text-xs text-gray-500">
                {t('enable_portal_password_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.enable_client_portal_password ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.enable_client_portal_password)}
          onValueChange={(value) =>
            handleChange('settings.enable_client_portal_password', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="show_accept_invoice_terms" />
            )}

            <div className="flex flex-col">
              <span>{t('show_accept_invoice_terms')}</span>
              <span className="text-xs text-gray-500">
                {t('show_accept_invoice_terms_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.show_accept_invoice_terms ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.show_accept_invoice_terms)}
          onValueChange={(value) =>
            handleChange('settings.show_accept_invoice_terms', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="show_accept_quote_terms" />
            )}

            <div className="flex flex-col">
              <span>{t('show_accept_quote_terms')}</span>
              <span className="text-xs text-gray-500">
                {t('show_accept_quote_terms_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.show_accept_quote_terms === 'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.show_accept_quote_terms)}
          onValueChange={(value) =>
            handleChange('settings.show_accept_quote_terms', value)
          }
        />
      </Element>

      <Divider />

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="require_invoice_signature" />
            )}

            <div className="flex flex-col">
              <span>{t('require_invoice_signature')}</span>
              <span className="text-xs text-gray-500">
                {t('require_invoice_signature_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.require_invoice_signature ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.require_invoice_signature)}
          onValueChange={(value) =>
            handleChange('settings.require_invoice_signature', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="require_quote_signature" />
            )}

            <div className="flex flex-col">
              <span>{t('require_quote_signature')}</span>
              <span className="text-xs text-gray-500">
                {t('require_quote_signature_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.require_quote_signature === 'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.require_quote_signature)}
          onValueChange={(value) =>
            handleChange('settings.require_quote_signature', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="require_purchase_order_signature" />
            )}

            <div className="flex flex-col">
              <span>{t('require_purchase_order_signature')}</span>
              <span className="text-xs text-gray-500">
                {t('require_purchase_order_signature_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.require_purchase_order_signature ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.require_purchase_order_signature)}
          onValueChange={(value) =>
            handleChange('settings.require_purchase_order_signature', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="signature_on_pdf" />
            )}

            <div className="flex flex-col">
              <span>{t('signature_on_pdf')}</span>
              <span className="text-xs text-gray-500">
                {t('signature_on_pdf_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.signature_on_pdf === 'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.signature_on_pdf)}
          onValueChange={(value) =>
            handleChange('settings.signature_on_pdf', value)
          }
        />
      </Element>
    </Card>
  );
}
