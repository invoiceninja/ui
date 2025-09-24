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
import { InputField, Link, SelectField } from '$app/components/forms';
import { isHosted, trans } from '$app/common/helpers';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Divider } from '$app/components/cards/Divider';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import Toggle from '$app/components/forms/Toggle';
import { Settings } from '$app/components/layouts/Settings';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  isCompanySettingsFormBusy,
  useHandleCompanySave,
} from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '../common/atoms';
import { UserSelector } from '$app/components/users/UserSelector';
import { toast } from '$app/common/helpers/toast/toast';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { useEmailProviders } from './common/hooks/useEmailProviders';
import { SMTPMailDriver } from './common/components/SMTPMailDriver';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import reactStringReplace from 'react-string-replace';
import { useState } from 'react';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { SendTimeModal } from './common/components/SendTimeModal';
import { useColorScheme } from '$app/common/colors';

export function EmailSettings() {
  useTitle('email_settings');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('email_settings'), href: '/settings/email_settings' },
  ];

  const colors = useColorScheme();
  const company = useInjectCompanyChanges();
  const currentCompany = useCurrentCompany();
  const emailProviders = useEmailProviders();
  const showPlanAlert = useShouldDisableAdvanceSettings();

  const errors = useAtomValue(companySettingsErrorsAtom);
  const isFormBusy = useAtomValue(isCompanySettingsFormBusy);

  const [isSendTimeModalOpen, setIsSendTimeModalOpen] =
    useState<boolean>(false);

  const onCancel = useDiscardChanges();
  const onSave = useHandleCompanySave();
  const disableSettingsField = useDisableSettingsField();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const handleOnSaveClick = () => {
    if (
      currentCompany?.settings.entity_send_time !==
      company?.settings.entity_send_time
    ) {
      setIsSendTimeModalOpen(true);
    } else {
      onSave();
    }
  };

  return (
    <>
      <Settings
        title={t('email_settings')}
        docsLink="en/advanced-settings/#email_settings"
        breadcrumbs={pages}
        onSaveClick={handleOnSaveClick}
        onCancelClick={onCancel}
        disableSaveButton={showPlanAlert || isFormBusy}
      >
        <AdvancedSettingsPlanAlert />

        <Card
          title={t('email_settings')}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          headerStyle={{ borderColor: colors.$20 }}
        >
          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="show_email_footer"
                labelElement={<SettingsLabel label={t('show_email_footer')} />}
              />
            }
          >
            <Toggle
              checked={Boolean(company?.settings.show_email_footer)}
              onValueChange={(value) =>
                handleChange('settings.show_email_footer', value)
              }
              disabled={disableSettingsField('show_email_footer')}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="pdf_email_attachment"
                labelElement={<SettingsLabel label={t('attach_pdf')} />}
              />
            }
          >
            <Toggle
              checked={Boolean(company?.settings.pdf_email_attachment)}
              onValueChange={(value) =>
                handleChange('settings.pdf_email_attachment', value)
              }
              disabled={disableSettingsField('pdf_email_attachment')}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="document_email_attachment"
                labelElement={<SettingsLabel label={t('attach_documents')} />}
              />
            }
          >
            <Toggle
              checked={Boolean(company?.settings.document_email_attachment)}
              onValueChange={(value) =>
                handleChange('settings.document_email_attachment', value)
              }
              disabled={disableSettingsField('document_email_attachment')}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="ubl_email_attachment"
                labelElement={
                  <SettingsLabel
                    label={t('attach_ubl')}
                    helpLabel={reactStringReplace(
                      `${t('ubl_email_attachment_help')}.`,
                      ':here',
                      () => (
                        <Link className="text-xs" to="/settings/e_invoice">
                          {t('here')}
                        </Link>
                      )
                    )}
                  />
                }
              />
            }
          >
            <Toggle
              checked={Boolean(company?.settings.ubl_email_attachment)}
              onValueChange={(value) =>
                handleChange('settings.ubl_email_attachment', value)
              }
              disabled={disableSettingsField('ubl_email_attachment')}
            />
          </Element>

          <div className="px-4 sm:px-6 py-4">
            <Divider
              className="border-dashed"
              withoutPadding
              style={{ borderColor: colors.$20 }}
            />
          </div>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="email_sending_method"
                labelElement={<SettingsLabel label={t('email_provider')} />}
                defaultValue="default"
              />
            }
          >
            <SelectField
              value={company?.settings.email_sending_method || 'default'}
              onValueChange={(value) =>
                handleChange('settings.email_sending_method', value)
              }
              disabled={
                disableSettingsField('email_sending_method') ||
                (!proPlan() && !enterprisePlan())
              }
              errorMessage={errors?.errors['settings.email_sending_method']}
              customSelector
              dismissable={false}
            >
              {emailProviders
                .filter(({ enabled }) => enabled)
                .map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </SelectField>
          </Element>

          {(company?.settings.email_sending_method === 'office365' ||
            company?.settings.email_sending_method === 'microsoft' ||
            company?.settings.email_sending_method === 'gmail') &&
            isHosted() && (
              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey="gmail_sending_user_id"
                    labelElement={
                      <SettingsLabel label={`Gmail / Microsoft ${t('user')}`} />
                    }
                  />
                }
              >
                <UserSelector
                  endpoint="/api/v1/users?sending_users=true"
                  value={company?.settings?.gmail_sending_user_id}
                  onChange={(user) =>
                    handleChange('settings.gmail_sending_user_id', user.id)
                  }
                  onClearButtonClick={() =>
                    handleChange('settings.gmail_sending_user_id', '0')
                  }
                  readonly={disableSettingsField('gmail_sending_user_id')}
                  withoutAction
                  errorMessage={
                    errors?.errors['settings.gmail_sending_user_id']
                  }
                />
              </Element>
            )}

          {company?.settings.email_sending_method === 'client_postmark' && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="postmark_secret"
                  labelElement={<SettingsLabel label={t('secret')} />}
                />
              }
            >
              <InputField
                value={company?.settings.postmark_secret || ''}
                onValueChange={(value) =>
                  handleChange('settings.postmark_secret', value)
                }
                disabled={disableSettingsField('postmark_secret')}
                errorMessage={errors?.errors['settings.postmark_secret']}
              />
            </Element>
          )}

          {company?.settings.email_sending_method === 'client_ses' && (
            <>
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="ses_secret_key"
                    labelElement={<SettingsLabel label={t('ses_secret_key')} />}
                />
              }
            >
              <InputField
                value={company?.settings.ses_secret_key || ''}
                onValueChange={(value) =>
                  handleChange('settings.ses_secret_key', value)
                }
                disabled={disableSettingsField('ses_secret_key')}
                errorMessage={errors?.errors['settings.ses_secret_key']}
              />
            </Element>

            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="ses_access_key"
                    labelElement={<SettingsLabel label={t('ses_access_key')} />}
                />
              }
            >
              <InputField
                value={company?.settings.ses_access_key || ''}
                onValueChange={(value) =>
                  handleChange('settings.ses_access_key', value)
                }
                disabled={disableSettingsField('ses_access_key')}
                errorMessage={errors?.errors['settings.ses_access_key']}
              />
            </Element>

            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="ses_region"
                  labelElement={<SettingsLabel label={t('region')} />}
                />
              }
              leftSideHelp={t('ses_region_help')}
              >
                <InputField
                  value={company?.settings.ses_region || ''}
                  onValueChange={(value) =>
                    handleChange('settings.ses_region', value)
                  }
                  disabled={disableSettingsField('ses_region')}
                  errorMessage={errors?.errors['settings.ses_region']}
                />
            </Element>

            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="ses_topic_arn"
                  labelElement={<SettingsLabel label={t('topic_arn')} />}
                />
              }
              leftSideHelp={t('ses_topic_arn_help')}
            >
                <InputField
                  value={company?.settings.ses_topic_arn || ''}
                  onValueChange={(value) =>
                    handleChange('settings.ses_topic_arn', value)
                  }
                  disabled={disableSettingsField('ses_topic_arn')}
                  errorMessage={errors?.errors['settings.ses_topic_arn']}
                />

            </Element>
            </>
          )}

          {company?.settings.email_sending_method === 'client_mailgun' && (
            <>
              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey="mailgun_secret"
                    labelElement={<SettingsLabel label={t('secret')} />}
                  />
                }
              >
                <InputField
                  value={company?.settings.mailgun_secret || ''}
                  onValueChange={(value) =>
                    handleChange('settings.mailgun_secret', value)
                  }
                  disabled={disableSettingsField('mailgun_secret')}
                  errorMessage={errors?.errors['settings.mailgun_secret']}
                />
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey="mailgun_domain"
                    labelElement={<SettingsLabel label={t('domain')} />}
                  />
                }
              >
                <InputField
                  value={company?.settings.mailgun_domain || ''}
                  onValueChange={(value) =>
                    handleChange('settings.mailgun_domain', value)
                  }
                  disabled={disableSettingsField('mailgun_domain')}
                  errorMessage={errors?.errors['settings.mailgun_domain']}
                />
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey="mailgun_endpoint"
                    labelElement={<SettingsLabel label={t('endpoint')} />}
                    defaultValue="api.mailgun.net"
                  />
                }
              >
                <SelectField
                  value={
                    company?.settings.mailgun_endpoint || 'api.mailgun.net'
                  }
                  onValueChange={(value) =>
                    handleChange('settings.mailgun_endpoint', value)
                  }
                  disabled={disableSettingsField('mailgun_endpoint')}
                  errorMessage={errors?.errors['settings.mailgun_endpoint']}
                  customSelector
                  dismissable={false}
                >
                  <option value="api.mailgun.net" defaultChecked>
                    api.mailgun.net
                  </option>
                  <option value="api.eu.mailgun.net">api.eu.mailgun.net</option>
                </SelectField>
              </Element>
            </>
          )}

          {company?.settings.email_sending_method === 'client_brevo' && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="brevo_secret"
                  labelElement={<SettingsLabel label={t('secret')} />}
                />
              }
            >
              <InputField
                value={company?.settings.brevo_secret || ''}
                onValueChange={(value) =>
                  handleChange('settings.brevo_secret', value)
                }
                disabled={disableSettingsField('brevo_secret')}
                errorMessage={errors?.errors['settings.brevo_secret']}
              />
            </Element>
          )}

          {(company?.settings.email_sending_method === 'client_mailgun' ||
            company?.settings.email_sending_method === 'client_postmark' ||
            company?.settings.email_sending_method === 'smtp' ||
            company?.settings.email_sending_method === 'client_brevo') && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="custom_sending_email"
                  labelElement={<SettingsLabel label={t('from_email')} />}
                />
              }
            >
              <InputField
                value={company?.settings.custom_sending_email || ''}
                onValueChange={(value) =>
                  handleChange('settings.custom_sending_email', value)
                }
                disabled={disableSettingsField('custom_sending_email')}
                errorMessage={errors?.errors['settings.custom_sending_email']}
              />
            </Element>
          )}

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="email_from_name"
                labelElement={<SettingsLabel label={t('from_name')} />}
              />
            }
          >
            <InputField
              value={company?.settings.email_from_name || ''}
              onValueChange={(value) =>
                handleChange('settings.email_from_name', value)
              }
              disabled={disableSettingsField('email_from_name')}
              errorMessage={errors?.errors['settings.email_from_name']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="reply_to_name"
                labelElement={<SettingsLabel label={t('reply_to_name')} />}
              />
            }
          >
            <InputField
              value={company?.settings.reply_to_name || ''}
              onValueChange={(value) =>
                handleChange('settings.reply_to_name', value)
              }
              disabled={disableSettingsField('reply_to_name')}
              errorMessage={errors?.errors['settings.reply_to_name']}
            />
          </Element>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="reply_to_email"
                labelElement={<SettingsLabel label={t('reply_to_email')} />}
              />
            }
          >
            <InputField
              value={company?.settings.reply_to_email || ''}
              onValueChange={(value) =>
                handleChange('settings.reply_to_email', value)
              }
              disabled={disableSettingsField('reply_to_email')}
              errorMessage={errors?.errors['settings.reply_to_email']}
            />
          </Element>

          {company?.settings.email_sending_method !== 'smtp' && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="bcc_email"
                  labelElement={
                    <SettingsLabel
                      label={t('bcc_email')}
                      helpLabel={t('comma_sparated_list')}
                    />
                  }
                />
              }
            >
              <InputField
                value={company?.settings.bcc_email || ''}
                onValueChange={(value) =>
                  handleChange('settings.bcc_email', value)
                }
                disabled={disableSettingsField('bcc_email')}
                errorMessage={errors?.errors['settings.bcc_email']}
              />
            </Element>
          )}

          {company?.settings.email_sending_method !== 'smtp' && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="entity_send_time"
                  labelElement={<SettingsLabel label={t('send_time')} />}
                />
              }
            >
              <SelectField
                value={company?.settings.entity_send_time?.toString() || ''}
                onValueChange={(value) =>
                  handleChange(
                    'settings.entity_send_time',
                    value.length > 0 ? value : 6
                  )
                }
                withBlank
                disabled={disableSettingsField('entity_send_time')}
                errorMessage={errors?.errors['settings.entity_send_time']}
                customSelector
              >
                {[...Array(24).keys()].map((number, index) => (
                  <option key={index} value={(number + 1).toString()}>
                    {dayjs()
                      .startOf('day')
                      .add(number + 1, 'hour')
                      .format('h:ss A')}
                  </option>
                ))}
              </SelectField>
            </Element>
          )}

          {company?.settings.email_sending_method === 'smtp' && (
            <SMTPMailDriver />
          )}

          <div className="px-4 sm:px-6 py-4">
            <Divider
              className="border-dashed"
              withoutPadding
              style={{ borderColor: colors.$20 }}
            />
          </div>

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="email_style"
                labelElement={<SettingsLabel label={t('email_design')} />}
                defaultValue="plain"
              />
            }
          >
            <SelectField
              value={company?.settings.email_style || 'plain'}
              onValueChange={(value) =>
                handleChange('settings.email_style', value)
              }
              disabled={disableSettingsField('email_style')}
              errorMessage={errors?.errors['settings.email_style']}
              customSelector
              dismissable={false}
            >
              <option value="plain">{t('plain')}</option>
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
              <option value="custom">{t('custom')}</option>
            </SelectField>
          </Element>

          {company?.settings.email_style === 'custom' && (
            <Element
              leftSide={
                <PropertyCheckbox
                  propertyKey="email_style_custom"
                  labelElement={<SettingsLabel label={t('custom')} />}
                />
              }
            >
              <InputField
                element="textarea"
                value={company?.settings.email_style_custom || ''}
                onValueChange={(value) =>
                  value.includes('$body')
                    ? handleChange('settings.email_style_custom', value)
                    : toast.error(
                        trans('body_variable_missing', { body: '$body' })
                      )
                }
                disabled={disableSettingsField('email_style_custom')}
                errorMessage={errors?.errors['settings.email_style_custom']}
              />
            </Element>
          )}

          <Element
            leftSide={
              <PropertyCheckbox
                propertyKey="email_signature"
                labelElement={<SettingsLabel label={t('signature')} />}
              />
            }
          >
            <MarkdownEditor
              value={company?.settings.email_signature || ''}
              onChange={(value) =>
                handleChange('settings.email_signature', value)
              }
              disabled={disableSettingsField('email_signature')}
            />
          </Element>
        </Card>
      </Settings>

      <SendTimeModal
        visible={isSendTimeModalOpen}
        setVisible={setIsSendTimeModalOpen}
        onConfirm={(syncEnabled) => {
          onSave({
            syncSendTime: syncEnabled,
          });
        }}
      />
    </>
  );
}
