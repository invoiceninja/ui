/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Divider } from '$app/components/cards/Divider';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { Card, Element } from '../../../../components/cards';
import { InputField, Link, SelectField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';
import { useAtom } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { request } from '$app/common/helpers/request';
import { useState } from 'react';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import classNames from 'classnames';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';

export function Settings() {
  const [t] = useTranslation();

  useInjectCompanyChanges();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const company = useCompanyChanges();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [errors, setErrors] = useAtom(companySettingsErrorsAtom);
  const [subdomainValidation, setSubdomainValidation] = useState('');

  const checkSubdomain = (value: string) => {
    setErrors(undefined);
    request('POST', endpoint('/api/v1/check_subdomain'), {
      subdomain: value,
    })
      .then(() => {
        handleChange('subdomain', value);
        setSubdomainValidation('');
      })
      .catch(() => {
        setSubdomainValidation(t('subdomain_is_not_available') ?? '');
        handleChange('subdomain', value);
      });
  };

  return (
    <Card title={t('settings')}>
      {isHosted() && isCompanySettingsActive && (
        <>
          <Element
            leftSide={t('portal_mode')}
            leftSideHelp={t('subdomain_guide')}
          >
            <SelectField
              disabled={freePlan()}
              id="portal_mode"
              value={company?.portal_mode || 'subdomain'}
              onValueChange={(value) => handleChange('portal_mode', value)}
              errorMessage={errors?.errors.portal_mode}
            >
              <option value="subdomain" key="subdomain">
                {t('subdomain')}
              </option>
              <option value="domain" key="domain">
                {t('domain')}
              </option>
            </SelectField>
          </Element>

          {company?.portal_mode === 'subdomain' && (
            <Element leftSide={t('subdomain')}>
              <InputField
                value={company?.subdomain || ''}
                disabled={freePlan()}
                onValueChange={(value) => checkSubdomain(value)}
                errorMessage={errors?.errors.subdomain ?? subdomainValidation}
              />
            </Element>
          )}

          {company?.portal_mode === 'domain' && (
            <Element
              leftSide={t('domain_url')}
              leftSideHelp="custom domain info"
            >
              <InputField
                value={company?.portal_domain || ''}
                onValueChange={(value) => handleChange('portal_domain', value)}
                errorMessage={errors?.errors.portal_domain}
              />
            </Element>
          )}
        </>
      )}

      {isSelfHosted() && isCompanySettingsActive && (
        <Element leftSide={t('domain_url')}>
          <InputField
            value={company?.portal_domain || ''}
            onValueChange={(value) => handleChange('portal_domain', value)}
            errorMessage={errors?.errors.portal_domain}
          />
        </Element>
      )}

      {isCompanySettingsActive && (
        <Element
          leftSide={
            <span>
              {t('login')} {t('url')}
            </span>
          }
        >
          <div className="flex flex-col space-y-1">
            <CopyToClipboard text={`${company?.portal_domain}/client/login`} />

            {isHosted() && company.portal_mode === 'domain' && (
              <div>
                <span>{t('app_help_link')}</span>
                <Link
                  external
                  to="https://invoiceninja.github.io/en/hosted-custom-domain/#custom-domain-configuration"
                >
                  {t('here')}
                </Link>
                .
              </div>
            )}
          </div>
        </Element>
      )}

      {isCompanySettingsActive && <Divider />}

      <Element
        className={classNames({ 'mt-4': isCompanySettingsActive })}
        leftSide={
          <div className="flex">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="enable_client_portal" />
            )}
            {t('client_portal')}
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.enable_client_portal === 'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.enable_client_portal)}
          onValueChange={(value) =>
            handleChange('settings.enable_client_portal', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="client_portal_enable_uploads" />
            )}

            <div className="flex flex-col">
              <span>{t('client_document_upload')}</span>
              <span className="text-xs text-gray-500">
                {t('document_upload_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.client_portal_enable_uploads ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.client_portal_enable_uploads)}
          onValueChange={(value) =>
            handleChange('settings.client_portal_enable_uploads', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="vendor_portal_enable_uploads" />
            )}

            <div className="flex flex-col">
              <span>{t('vendor_document_upload')}</span>
              <span className="text-xs text-gray-500">
                {t('vendor_document_upload_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.vendor_portal_enable_uploads ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(company?.settings.vendor_portal_enable_uploads)}
          onValueChange={(value) =>
            handleChange('settings.vendor_portal_enable_uploads', value)
          }
        />
      </Element>

      <Element
        leftSide={
          <div className="flex items-center">
            {!isCompanySettingsActive && (
              <PropertyCheckbox propertyKey="accept_client_input_quote_approval" />
            )}

            <div className="flex flex-col">
              <span>{t('accept_purchase_order_number')}</span>
              <span className="text-xs text-gray-500">
                {t('accept_purchase_order_number_help')}
              </span>
            </div>
          </div>
        }
      >
        <Toggle
          disabled={
            Boolean(
              typeof company?.settings?.accept_client_input_quote_approval ===
                'undefined'
            ) && !isCompanySettingsActive
          }
          checked={Boolean(
            company?.settings.accept_client_input_quote_approval
          )}
          onValueChange={(value) =>
            handleChange('settings.accept_client_input_quote_approval', value)
          }
        />
      </Element>

      {/* <Element leftSide={t('storefront')} leftSideHelp={t('storefront_help')}>
        <Toggle />
      </Element> */}

      <Divider />

      <Element className="mt-4" leftSide={t('terms_of_service')}>
        <InputField
          element="textarea"
          onValueChange={(value) =>
            handleChange('settings.client_portal_terms', value)
          }
          value={company?.settings.client_portal_terms || ''}
          errorMessage={errors?.errors['settings.client_portal_terms']}
        />
      </Element>

      <Element leftSide={t('privacy_policy')}>
        <InputField
          element="textarea"
          onValueChange={(value) =>
            handleChange('settings.client_portal_privacy_policy', value)
          }
          value={company?.settings.client_portal_privacy_policy || ''}
          errorMessage={errors?.errors['settings.client_portal_privacy_policy']}
        />
      </Element>
    </Card>
  );
}
