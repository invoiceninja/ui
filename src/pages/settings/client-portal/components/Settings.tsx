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

export function Settings() {
  const [t] = useTranslation();

  useInjectCompanyChanges();

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
      {isHosted() && (
        <>
          <Element
            leftSide={t('portal_mode')}
            leftSideHelp={t('subdomain_guide')}
          >
            <SelectField
              disabled={freePlan()}
              id="portal_mode"
              value={company?.portal_mode}
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
                value={company?.subdomain}
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
                value={company?.portal_domain}
                onValueChange={(value) => handleChange('portal_domain', value)}
                errorMessage={errors?.errors.portal_domain}
              />
            </Element>
          )}
        </>
      )}

      {isSelfHosted() && (
        <Element leftSide={t('domain_url')}>
          <InputField
            value={company?.portal_domain}
            onValueChange={(value) => handleChange('portal_domain', value)}
            errorMessage={errors?.errors.portal_domain}
          />
        </Element>
      )}

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

      <Divider />

      <Element className="mt-4" leftSide={t('client_portal')}>
        <Toggle
          checked={company?.settings.enable_client_portal}
          onValueChange={(value) =>
            handleChange('settings.enable_client_portal', value)
          }
        />
      </Element>

      <Element
        leftSide={t('client_document_upload')}
        leftSideHelp={t('document_upload_help')}
      >
        <Toggle
          checked={company?.settings.client_portal_enable_uploads}
          onValueChange={(value) =>
            handleChange('settings.client_portal_enable_uploads', value)
          }
        />
      </Element>

      <Element
        leftSide={t('vendor_document_upload')}
        leftSideHelp={t('vendor_document_upload_help')}
      >
        <Toggle
          checked={company?.settings.vendor_portal_enable_uploads}
          onValueChange={(value) =>
            handleChange('settings.vendor_portal_enable_uploads', value)
          }
        />
      </Element>

      <Element
        leftSide={t('accept_purchase_order_number')}
        leftSideHelp={t('accept_purchase_order_number_help')}
      >
        <Toggle
          checked={company?.settings.accept_client_input_quote_approval}
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
          value={company?.settings.client_portal_terms}
          errorMessage={errors?.errors['settings.client_portal_terms']}
        />
      </Element>

      <Element leftSide={t('privacy_policy')}>
        <InputField
          element="textarea"
          onValueChange={(value) =>
            handleChange('settings.client_portal_privacy_policy', value)
          }
          value={company?.settings.client_portal_privacy_policy}
          errorMessage={errors?.errors['settings.client_portal_privacy_policy']}
        />
      </Element>
    </Card>
  );
}
