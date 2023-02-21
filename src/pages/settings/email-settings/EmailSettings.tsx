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
import { trans } from 'common/helpers';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useShouldDisableAdvanceSettings } from 'common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from 'common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { Divider } from 'components/cards/Divider';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import Toggle from 'components/forms/Toggle';
import { Settings } from 'components/layouts/Settings';
import dayjs from 'dayjs';
import { useHandleCancel } from 'pages/invoices/edit/hooks/useHandleCancel';
import toast from 'react-hot-toast';
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

  const showPlanAlert = useShouldDisableAdvanceSettings();

  return (
    <Settings
      title={t('email_settings')}
      docsLink="docs/advanced-settings/#email_settings"
      breadcrumbs={pages}
      onSaveClick={onSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Card title={t('settings')}>
        <Element leftSide={t('show_email_footer')}>
          <Toggle
            checked={company?.settings.show_email_footer}
            onValueChange={(value) =>
              handleChange('settings.show_email_footer', value)
            }
          />
        </Element>

        <Element leftSide={t('attach_pdf')}>
          <Toggle
            checked={company?.settings.pdf_email_attachment}
            onValueChange={(value) =>
              handleChange('settings.pdf_email_attachment', value)
            }
          />
        </Element>

        <Element leftSide={t('attach_documents')}>
          <Toggle
            checked={company?.settings.document_email_attachment}
            onValueChange={(value) =>
              handleChange('settings.document_email_attachment', value)
            }
          />
        </Element>

        <Element leftSide={t('attach_ubl')}>
          <Toggle
            checked={company?.settings.ubl_email_attachment}
            onValueChange={(value) =>
              handleChange('settings.ubl_email_attachment', value)
            }
          />
        </Element>

        <Divider />

        <Element leftSide={t('email_provider')}>
          <SelectField
            value={company?.settings.email_sending_method}
            onValueChange={(value) =>
              handleChange('settings.email_sending_method', value)
            }
          >
            <option defaultChecked value="default">
              {t('default')}
            </option>
            <option value="gmail">Gmail</option>
            <option value="microsoft">Microsoft</option>
            <option value="client_postmark">Postmark</option>
            <option value="client_mailgun">Mailgun</option>
          </SelectField>
        </Element>

        {company?.settings.email_sending_method === 'client_postmark' && (
          <Element leftSide={t('secret')}>
            <InputField
              value={company?.settings.postmark_secret}
              onValueChange={(value) =>
                handleChange('settings.postmark_secret', value)
              }
            />
          </Element>
        )}

        {company?.settings.email_sending_method === 'client_mailgun' && (
          <>
            <Element leftSide={t('secret')}>
              <InputField
                value={company?.settings.mailgun_secret}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_secret', value)
                }
              />
            </Element>

            <Element leftSide={t('domain')}>
              <InputField
                value={company?.settings.mailgun_domain}
                onValueChange={(value) =>
                  handleChange('settings.mailgun_domain', value)
                }
              />
            </Element>
          </>
        )}

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

        <Element leftSide={t('send_time')}>
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

        <Divider />

        <Element leftSide={t('email_design')}>
          <SelectField
            value={company?.settings.email_style}
            onValueChange={(value) =>
              handleChange('settings.email_style', value)
            }
          >
            <option value="plain">{t('plain')}</option>
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="custom">{t('custom')}</option>
          </SelectField>
        </Element>

        {company?.settings.email_style === 'custom' && (
          <Element leftSide={t('custom')}>
            <InputField
              element="textarea"
              value={company?.settings.email_style_custom}
              onValueChange={(value) =>
                value.includes('$body')
                  ? handleChange('settings.email_style_custom', value)
                  : toast.error(
                      trans('body_variable_missing', { body: '$body' })
                    )
              }
            />
          </Element>
        )}

        <Element leftSide={t('signature')}>
          <MarkdownEditor
            value={company?.settings.email_signature}
            onChange={(value) =>
              handleChange('settings.email_signature', value)
            }
          />
        </Element>
      </Card>
    </Settings>
  );
}
