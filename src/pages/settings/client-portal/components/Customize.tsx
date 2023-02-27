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
import { InputField } from '@invoiceninja/forms';
import { isSelfHosted } from 'common/helpers';
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from 'pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';

export function Customize() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <Card title={t('customize')}>
      <Element leftSide={t('header')}>
        <InputField
          element="textarea"
          value={company?.settings.portal_custom_head}
          onValueChange={(value) =>
            handleChange('settings.portal_custom_head', value)
          }
        />
      </Element>

      <Element leftSide={t('footer')}>
        <InputField
          element="textarea"
          value={company?.settings.portal_custom_footer}
          onValueChange={(value) =>
            handleChange('settings.portal_custom_footer', value)
          }
        />
      </Element>

      {isSelfHosted() && (
        <>
          <Element leftSide={t('custom_css')}>
            <InputField
              element="textarea"
              value={company?.settings.portal_custom_css}
              onValueChange={(value) =>
                handleChange('settings.portal_custom_css', value)
              }
            />
          </Element>

          <Element leftSide={t('custom_javascript')}>
            <InputField
              element="textarea"
              value={company?.settings.portal_custom_js}
              onValueChange={(value) =>
                handleChange('settings.portal_custom_js', value)
              }
            />
          </Element>
        </>
      )}
    </Card>
  );
}
