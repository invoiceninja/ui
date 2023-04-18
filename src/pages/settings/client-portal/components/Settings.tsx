/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { Divider } from '$app/components/cards/Divider';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Icon } from '$app/components/icons/Icon';
import { Tooltip } from '$app/components/Tooltip';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { MdInfoOutline } from 'react-icons/md';
import { Card, Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import Toggle from '../../../../components/forms/Toggle';

export function Settings() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <Card title={t('settings')}>
      <Element leftSide={t('domain_url')}>
        <InputField
          value={company?.portal_domain}
          onValueChange={(value) => handleChange('portal_domain', value)}
        />
      </Element>

      <Element
        leftSide={
          <div className="flex space-x-2">
            <span>
              {t('login')} {t('url')}
            </span>

            <Tooltip
              placement="top"
              messageElement={
                <div className="p-2 text-xs text-white rounded-md bg-gray-500 space-x-1">
                  <span>For more instructions, please follow the</span>
                  <a
                    style={{ color: '#6ba8f0' }}
                    className="underline hover:no-underline"
                    href="https://invoiceninja.github.io/docs/hosted-custom-domain/#custom-domain-configuration"
                    target="_blank"
                    rel="noreferrer"
                  >
                    link
                  </a>
                  .
                </div>
              }
            >
              <Icon
                element={MdInfoOutline}
                className="cursor-pointer"
                size={20}
              />
            </Tooltip>
          </div>
        }
      >
        <CopyToClipboard text={`${company?.portal_domain}/client/login`} />
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
        />
      </Element>

      <Element leftSide={t('privacy_policy')}>
        <InputField
          element="textarea"
          onValueChange={(value) =>
            handleChange('settings.client_portal_privacy_policy', value)
          }
          value={company?.settings.client_portal_privacy_policy}
        />
      </Element>
    </Card>
  );
}
