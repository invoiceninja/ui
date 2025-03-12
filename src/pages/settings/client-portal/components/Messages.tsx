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
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';

export function Messages() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const disableSettingsField = useDisableSettingsField();

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const errors = useAtomValue(companySettingsErrorsAtom);

  return (
    <Card title={t('messages')}>
      {isCompanySettingsActive && (
        <Element leftSide={t('dashboard')}>
          <InputField
            element="textarea"
            value={company?.settings.custom_message_dashboard || ''}
            onValueChange={(value) =>
              handleChange('settings.custom_message_dashboard', value)
            }
            errorMessage={errors?.errors['settings.custom_message_dashboard']}
          />
        </Element>
      )}

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="custom_message_unpaid_invoice"
            labelElement={<SettingsLabel label={t('unpaid_invoice')} />}
          />
        }
      >
        <InputField
          element="textarea"
          value={company?.settings.custom_message_unpaid_invoice || ''}
          onValueChange={(value) =>
            handleChange('settings.custom_message_unpaid_invoice', value)
          }
          disabled={disableSettingsField('custom_message_unpaid_invoice')}
          errorMessage={
            errors?.errors['settings.custom_message_unpaid_invoice']
          }
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="custom_message_paid_invoice"
            labelElement={<SettingsLabel label={t('paid_invoice')} />}
          />
        }
      >
        <InputField
          element="textarea"
          value={company?.settings.custom_message_paid_invoice || ''}
          onValueChange={(value) =>
            handleChange('settings.custom_message_paid_invoice', value)
          }
          disabled={disableSettingsField('custom_message_paid_invoice')}
          errorMessage={errors?.errors['settings.custom_message_paid_invoice']}
        />
      </Element>

      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="custom_message_unapproved_quote"
            labelElement={<SettingsLabel label={t('unapproved_quote')} />}
          />
        }
      >
        <InputField
          element="textarea"
          value={company?.settings.custom_message_unapproved_quote || ''}
          onValueChange={(value) =>
            handleChange('settings.custom_message_unapproved_quote', value)
          }
          disabled={disableSettingsField('custom_message_unapproved_quote')}
          errorMessage={
            errors?.errors['settings.custom_message_unapproved_quote']
          }
        />
      </Element>
    </Card>
  );
}
