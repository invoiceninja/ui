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
import { InputField } from '$app/components/forms';
import { isSelfHosted } from '$app/common/helpers';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';

export function Customize() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const disableSettingsField = useDisableSettingsField();

  const errors = useAtomValue(companySettingsErrorsAtom);

  return (
    <Card title={t('customize')}>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="portal_custom_head"
            labelElement={<SettingsLabel label={t('header')} />}
          />
        }
      >
        <InputField
          element="textarea"
          value={company?.settings.portal_custom_head || ''}
          onValueChange={(value) =>
            handleChange('settings.portal_custom_head', value)
          }
          disabled={disableSettingsField('portal_custom_head')}
          errorMessage={errors?.errors['settings.portal_custom_head']}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="portal_custom_footer"
            labelElement={<SettingsLabel label={t('footer')} />}
          />
        }
      >
        <InputField
          element="textarea"
          value={company?.settings.portal_custom_footer || ''}
          onValueChange={(value) =>
            handleChange('settings.portal_custom_footer', value)
          }
          disabled={disableSettingsField('portal_custom_footer')}
          errorMessage={errors?.errors['settings.portal_custom_footer']}
        />
      </Element>

      {isSelfHosted() && (
        <>
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="portal_custom_css"
                labelElement={<SettingsLabel label={t('custom_css')} />}
              />
            }
          >
            <InputField
              element="textarea"
              value={company?.settings.portal_custom_css || ''}
              onValueChange={(value) =>
                handleChange('settings.portal_custom_css', value)
              }
              disabled={disableSettingsField('portal_custom_css')}
              errorMessage={errors?.errors['settings.portal_custom_css']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="portal_custom_js"
                labelElement={<SettingsLabel label={t('custom_javascript')} />}
              />
            }
          >
            <InputField
              element="textarea"
              value={company?.settings.portal_custom_js || ''}
              onValueChange={(value) =>
                handleChange('settings.portal_custom_js', value)
              }
              disabled={disableSettingsField('portal_custom_js')}
              errorMessage={errors?.errors['settings.portal_custom_js']}
            />
          </Element>
        </>
      )}
    </Card>
  );
}
