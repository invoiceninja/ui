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

export function Messages() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const errors = useAtomValue(companySettingsErrorsAtom);

  return (
    <Card title={t('messages')}>
      <Element leftSide={t('dashboard')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_dashboard}
          onValueChange={(value) =>
            handleChange('settings.custom_message_dashboard', value)
          }
          errorMessage={errors?.errors['settings.custom_message_dashboard']}
        />
      </Element>

      <Element leftSide={t('unpaid_invoice')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_unpaid_invoice}
          onValueChange={(value) =>
            handleChange('settings.custom_message_unpaid_invoice', value)
          }
          errorMessage={
            errors?.errors['settings.custom_message_unpaid_invoice']
          }
        />
      </Element>

      <Element leftSide={t('paid_invoice')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_paid_invoice}
          onValueChange={(value) =>
            handleChange('settings.custom_message_paid_invoice', value)
          }
          errorMessage={errors?.errors['settings.custom_message_paid_invoice']}
        />
      </Element>

      <Element leftSide={t('unapproved_quote')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_unapproved_quote}
          onValueChange={(value) =>
            handleChange('settings.custom_message_unapproved_quote', value)
          }
          errorMessage={
            errors?.errors['settings.custom_message_unapproved_quote']
          }
        />
      </Element>
    </Card>
  );
}
