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
import { useCompanyChanges } from 'common/hooks/useCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from 'pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';

export function Messages() {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <Card title={t('messages')}>
      <Element leftSide={t('dashboard')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_dashboard}
          onValueChange={(value) =>
            handleChange('settings.custom_message_dashboard', value)
          }
        />
      </Element>

      <Element leftSide={t('unpaid_invoice')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_unpaid_invoice}
          onValueChange={(value) =>
            handleChange('settings.custom_message_unpaid_invoice', value)
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
        />
      </Element>

      <Element leftSide={t('unapproved_quote')}>
        <InputField
          element="textarea"
          value={company?.settings.custom_message_unapproved_quote}
          onValueChange={(value) =>
            handleChange('settings.custom_message_unapproved_quote', value)
          }
        />
      </Element>
    </Card>
  );
}
