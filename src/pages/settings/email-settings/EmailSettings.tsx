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
import { InputField, SelectField } from '@invoiceninja/forms';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Settings } from 'components/layouts/Settings';
import dayjs from 'dayjs';
import { useHandleCancel } from 'pages/invoices/edit/hooks/useHandleCancel';
import { useTranslation } from 'react-i18next';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';

export function EmailSettings() {
  useTitle('email_settings');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('email_settings'), href: '/settings/email_settings' },
  ];

  const company = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const onSave = useHandleCompanySave();
  const onCancel = useHandleCancel();

  return (
    <Settings
      title={t('email_settings')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#email_settings"
      onSaveClick={onSave}
      onCancelClick={onCancel}
    >
      <Card title={t('settings')}>
        <Element leftSide={t('from_name')}>
          <InputField
            value={company?.settings.email_from_name}
            onValueChange={(value) =>
              handleChange('settings.email_from_name', value)
            }
          />
        </Element>

        <Element leftSide={t('reply_to_name')}>
          <InputField
            value={company?.settings.reply_to_name}
            onValueChange={(value) =>
              handleChange('settings.reply_to_name', value)
            }
          />
        </Element>

        <Element leftSide={t('reply_to_email')}>
          <InputField
            value={company?.settings.reply_to_email}
            onValueChange={(value) =>
              handleChange('settings.reply_to_email', value)
            }
          />
        </Element>

        <Element
          leftSide={t('bcc_email')}
          leftSideHelp={t('comma_sparated_list')}
        >
          <InputField
            value={company?.settings.bcc_email}
            onValueChange={(value) => handleChange('settings.bcc_email', value)}
          />
        </Element>

        <Element
          leftSide={t('send_time')}
          leftSideHelp={t('comma_sparated_list')}
        >
          <SelectField
            value={company?.settings.entity_send_time}
            onValueChange={(value) =>
              handleChange(
                'settings.entity_send_time',
                value.length > 0 ? value : 6
              )
            }
            withBlank
          >
            {[...Array(24).keys()].map((number, index) => (
              <option key={index} value={number + 1}>
                {dayjs()
                  .startOf('day')
                  .add(number + 1, 'hour')
                  .format('h:ss A')}
              </option>
            ))}
          </SelectField>
        </Element>
      </Card>
    </Settings>
  );
}
