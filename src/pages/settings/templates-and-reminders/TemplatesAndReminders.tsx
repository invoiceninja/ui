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
import { Button, InputField, SelectField } from '$app/components/forms';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { generateEmailPreview } from '$app/common/helpers/emails/generate-email-preview';
import { request } from '$app/common/helpers/request';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Settings as CompanySettings } from '$app/common/interfaces/company.interface';
import { TemplateBody, Templates } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Settings } from '$app/components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { Variable } from './common/components/Variable';
import { commonVariables } from './common/constants/variables/common-variables';
import { paymentVariables } from './common/constants/variables/payment-variables';
import Toggle from '$app/components/forms/Toggle';
import frequencies from '$app/common/constants/frequency';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { cloneDeep } from 'lodash';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { Spinner } from '$app/components/Spinner';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { EmailTemplate } from '$app/pages/invoices/email/components/Mailer';
import { route } from '$app/common/helpers/route';

const REMINDERS = ['reminder1', 'reminder2', 'reminder3'];

export function TemplatesAndReminders() {
  useTitle('templates_and_reminders');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('templates_and_reminders'),
      href: '/settings/templates_and_reminders',
    },
  ];

  const company = useInjectCompanyChanges();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const onCancel = useDiscardChanges();
  const handleSave = useHandleCompanySave();
  const disableSettingsField = useDisableSettingsField();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const { data: statics } = useStaticsQuery();
  const [templateId, setTemplateId] = useState(
    isCompanySettingsActive || company?.settings.email_template_invoice
      ? 'invoice'
      : ''
  );
  const [templateBody, setTemplateBody] = useState<TemplateBody>();
  const [preview, setPreview] = useState<EmailTemplate>();
  const canChangeEmailTemplate = (isHosted() && !freePlan()) || isSelfHosted();

  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [reminderIndex, setReminderIndex] = useState<number>(-1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const getTemplateKey = (templateId: string) => {
    if (templateId === 'partial_payment') {
      return 'payment_partial';
    }

    return templateId as keyof CompanySettings;
  };

  const emailSubjectKey = (
    templateId === 'quote_reminder1'
      ? 'email_quote_subject_reminder1'
      : `email_subject_${getTemplateKey(templateId) || 'invoice'}`
  ) as keyof CompanySettings;
  const emailTemplateKey = (
    templateId === 'quote_reminder1'
      ? 'email_quote_template_reminder1'
      : `email_template_${getTemplateKey(templateId) || 'invoice'}`
  ) as keyof CompanySettings;

  const getNumDaysReminderKey = (index: number) => {
    return (
      templateId === 'quote_reminder1'
        ? 'quote_num_days_reminder1'
        : `num_days_reminder${index}`
    ) as keyof CompanySettings;
  };

  const getScheduleReminderKey = (index: number) => {
    return (
      templateId === 'quote_reminder1'
        ? 'quote_schedule_reminder1'
        : `schedule_reminder${index}`
    ) as keyof CompanySettings;
  };

  const getEnableReminderKey = (index: number) => {
    return (
      templateId === 'quote_reminder1'
        ? 'enable_quote_reminder1'
        : `enable_reminder${index}`
    ) as keyof CompanySettings;
  };

  const getLateFeeAmountKey = (index: number) => {
    return (
      templateId === 'quote_reminder1'
        ? 'quote_late_fee_amount1'
        : `late_fee_amount${index}`
    ) as keyof CompanySettings;
  };

  const getLateFeePercentKey = (index: number) => {
    return (
      templateId === 'quote_reminder1'
        ? 'quote_late_fee_percent1'
        : `late_fee_percent${index}`
    ) as keyof CompanySettings;
  };

  const handleSetTemplateBody = () => {
    if (statics?.templates && company && templateId) {
      const existing = {
        subject: company.settings[emailSubjectKey] as string,
        body: company.settings[emailTemplateKey] as string,
      };

      if (existing.subject?.length > 0 || existing.body?.length > 0) {
        setTemplateBody({ ...existing });
      } else {
        const template = statics.templates[templateId as keyof Templates] || {
          subject: company.settings[emailSubjectKey] || '',
          body: company.settings[emailTemplateKey] || '',
        };

        setTemplateBody({ ...template });
      }
    }
  };

  const handleSetReminderDetails = (currentReminderIndex?: number) => {
    const updatedCompanySettings = cloneDeep(company?.settings);

    if (updatedCompanySettings) {
      if (currentReminderIndex) {
        (updatedCompanySettings[
          getNumDaysReminderKey(currentReminderIndex)
        ] as number) = 0;

        (updatedCompanySettings[
          getScheduleReminderKey(currentReminderIndex)
        ] as string) = 'disabled';

        (updatedCompanySettings[
          getEnableReminderKey(currentReminderIndex)
        ] as boolean) = false;

        (updatedCompanySettings[
          getLateFeeAmountKey(currentReminderIndex)
        ] as number) = 0;

        (updatedCompanySettings[
          getLateFeePercentKey(currentReminderIndex)
        ] as number) = 0;
      } else {
        updatedCompanySettings.enable_reminder_endless = false;
        updatedCompanySettings.endless_reminder_frequency_id = '';
      }

      handleChange('settings', updatedCompanySettings);
    }
  };

  const handleRemoveReminderDetails = (
    currentReminderIndex: number,
    updateSettings?: CompanySettings
  ) => {
    const updatedCompanySettings = cloneDeep(
      updateSettings || company?.settings
    );

    if (updatedCompanySettings) {
      if (currentReminderIndex) {
        delete updatedCompanySettings[
          getNumDaysReminderKey(currentReminderIndex)
        ];

        delete updatedCompanySettings[
          getScheduleReminderKey(currentReminderIndex)
        ];

        delete updatedCompanySettings[
          getEnableReminderKey(currentReminderIndex)
        ];

        delete updatedCompanySettings[
          getLateFeeAmountKey(currentReminderIndex)
        ];

        delete updatedCompanySettings[
          getLateFeePercentKey(currentReminderIndex)
        ];
      } else {
        delete updatedCompanySettings.enable_reminder_endless;
        delete updatedCompanySettings.endless_reminder_frequency_id;
      }

      handleChange('settings', updatedCompanySettings);
    }
  };

  const handleChangingCheckbox = (value: boolean) => {
    if (!value) {
      const updatedCompanySettingsChanges: CompanySettings | undefined =
        cloneDeep(company?.settings);

      if (updatedCompanySettingsChanges) {
        const currentReminder =
          reminderIndex > -1 ? `reminder${reminderIndex}` : '';

        delete updatedCompanySettingsChanges[
          (templateId === 'quote_reminder1'
            ? 'email_quote_subject_reminder1'
            : `email_subject_${getTemplateKey(
                currentReminder || templateId
              )}`) as keyof typeof updatedCompanySettingsChanges
        ];

        if (
          REMINDERS.includes(templateId) ||
          templateId === 'reminder_endless'
        ) {
          handleRemoveReminderDetails(
            REMINDERS.indexOf(templateId) + 1,
            updatedCompanySettingsChanges
          );
        } else {
          handleChange('settings', updatedCompanySettingsChanges);
        }

        setTemplateBody(undefined);
      }
    }

    if (value && !templateId) {
      setTemplateId('invoice');
    }

    if (value && templateId) {
      handleSetTemplateBody();

      if (
        disableSettingsField(emailTemplateKey) &&
        REMINDERS.includes(templateId)
      ) {
        handleSetReminderDetails(REMINDERS.indexOf(templateId) + 1);
      }

      if (
        templateId === 'reminder_endless' &&
        disableSettingsField('email_template_reminder_endless')
      ) {
        handleSetReminderDetails();
      }
    }
  };

  useEffect(() => {
    if (statics?.templates && company && templateId) {
      if (REMINDERS.includes(templateId)) {
        setReminderIndex(REMINDERS.indexOf(templateId) + 1);
      } else {
        setReminderIndex(-1);
      }

      const template = company?.settings[emailTemplateKey];

      if (
        isCompanySettingsActive ||
        (template && !isCompanySettingsActive) ||
        (templateId === 'invoice' &&
          !template &&
          !isCompanySettingsActive &&
          isInitial)
      ) {
        handleSetTemplateBody();
      }

      isInitial && setIsInitial(false);
    }
  }, [statics, templateId]);

  useEffect(() => {
    if (templateId && templateBody) {
      handleChange(`settings.${emailSubjectKey}`, templateBody?.subject);
      handleChange(`settings.${emailTemplateKey}`, templateBody?.body);

      setIsLoadingPdf(true);

      request('POST', endpoint('/api/v1/templates'), {
        body: templateBody?.body,
        subject: templateBody?.subject,
        entity: '',
        entity_id: '',
        template: emailTemplateKey,
      })
        .then((response) => setPreview(response.data))
        .finally(() => setIsLoadingPdf(false));
    }
  }, [templateBody]);

  const variables =
    templateId === 'payment' ? paymentVariables : commonVariables;

  return (
    <Settings
      title={t('templates_and_reminders')}
      docsLink="en/advanced-settings/#templates_and_reminders"
      breadcrumbs={pages}
      onSaveClick={handleSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
    >
      <AdvancedSettingsPlanAlert />

      <Card title={t('edit')}>
        <Element
          leftSide={
            <PropertyCheckbox
              checked={Boolean(
                typeof company?.settings[emailTemplateKey] !== 'undefined'
              )}
              propertyKey={emailTemplateKey}
              labelElement={<SettingsLabel label={t('template')} />}
              defaultValue={templateId || 'invoice'}
              onCheckboxChange={(value) => handleChangingCheckbox(value)}
            />
          }
        >
          <SelectField
            value={templateId}
            onValueChange={(value) => {
              setTemplateId(value);
              !isCompanySettingsActive && setTemplateBody(undefined);
            }}
            cypressRef="templateSelector"
            customSelector
            dismissable={false}
          >
            {statics &&
              Object.keys(statics.templates).map((template, index) => (
                <option value={template} key={index}>
                  {t(template)}
                </option>
              ))}

            <option value="credit">{t('credit')}</option>
            <option value="purchase_order">{t('purchase_order')}</option>

            <option value="custom1">{t('first_custom')}</option>
            <option value="custom2">{t('second_custom')}</option>
            <option value="custom3">{t('third_custom')}</option>
          </SelectField>
        </Element>

        <Element
          leftSide={t('subject')}
          disabledLabels={disableSettingsField(emailTemplateKey)}
        >
          <InputField
            id="subject"
            value={templateBody?.subject || ''}
            onValueChange={(value) =>
              setTemplateBody(
                (current) => current && { ...current, subject: value }
              )
            }
            disabled={disableSettingsField(emailTemplateKey)}
          />
        </Element>

        <Element
          leftSide={t('body')}
          disabledLabels={disableSettingsField(emailTemplateKey)}
        >
          {canChangeEmailTemplate ? (
            <MarkdownEditor
              value={templateBody?.body || ''}
              onChange={(value) =>
                setTemplateBody(
                  (current) => current && { ...current, body: value }
                )
              }
              disabled={disableSettingsField(emailTemplateKey)}
            />
          ) : (
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-sm">
                {t('email_template_change')}{' '}
                <strong>
                  {t('enterprise')}/{t('pro')}
                </strong>{' '}
                {t('plan')}.
              </span>
              <Button
                behavior="button"
                className="mt-2"
                onClick={() => route('/settings/account_management')}
              >
                {t('plan_change')}
              </Button>
            </div>
          )}
        </Element>
      </Card>

      {(REMINDERS.includes(templateId) ||
        templateId === 'reminder_endless' ||
        templateId === 'quote_reminder1') &&
        !disableSettingsField(emailTemplateKey) && (
          <Card>
            {REMINDERS.includes(templateId) ||
            templateId === 'quote_reminder1' ? (
              <>
                <Element leftSide={t('days')}>
                  <NumberInputField
                    precision={0}
                    value={
                      company?.settings[getNumDaysReminderKey(reminderIndex)] ||
                      0
                    }
                    onValueChange={(value) =>
                      handleChange(
                        `settings.${getNumDaysReminderKey(reminderIndex)}`,
                        parseFloat(value) || 0
                      )
                    }
                    disablePrecision
                  />
                </Element>

                <Element leftSide={t('schedule')}>
                  <SelectField
                    value={
                      company?.settings[
                        getScheduleReminderKey(reminderIndex)
                      ] || 'disabled'
                    }
                    onValueChange={(value) =>
                      handleChange(
                        `settings.${getScheduleReminderKey(reminderIndex)}`,
                        value
                      )
                    }
                  >
                    <option value="disabled" defaultChecked>
                      {t('disabled')}
                    </option>
                    <option
                      value={
                        templateId === 'quote_reminder1'
                          ? 'after_quote_date'
                          : 'after_invoice_date'
                      }
                    >
                      {templateId === 'quote_reminder1'
                        ? t('after_quote_date')
                        : t('after_invoice_date')}
                    </option>
                    <option
                      value={
                        templateId === 'quote_reminder1'
                          ? 'before_valid_until_date'
                          : 'before_due_date'
                      }
                    >
                      {templateId === 'quote_reminder1'
                        ? t('before_valid_until_date')
                        : t('before_due_date')}
                    </option>
                    <option
                      value={
                        templateId === 'quote_reminder1'
                          ? 'after_valid_until_date'
                          : 'after_due_date'
                      }
                    >
                      {templateId === 'quote_reminder1'
                        ? t('after_valid_until_date')
                        : t('after_due_date')}
                    </option>
                  </SelectField>
                </Element>

                <Element leftSide={t('send_email')}>
                  <Toggle
                    checked={
                      Boolean(
                        company?.settings[getEnableReminderKey(reminderIndex)]
                      ) || false
                    }
                    onValueChange={(value) =>
                      handleChange(
                        `settings.${getEnableReminderKey(reminderIndex)}`,
                        value
                      )
                    }
                  />
                </Element>

                <Element leftSide={t('late_fee_amount')}>
                  <NumberInputField
                    value={
                      company?.settings[getLateFeeAmountKey(reminderIndex)] || 0
                    }
                    onValueChange={(value) =>
                      handleChange(
                        `settings.${getLateFeeAmountKey(reminderIndex)}`,
                        parseFloat(value) || 0
                      )
                    }
                  />
                </Element>

                <Element leftSide={t('late_fee_percent')}>
                  <NumberInputField
                    value={
                      company?.settings[getLateFeePercentKey(reminderIndex)] ||
                      0
                    }
                    onValueChange={(value) =>
                      handleChange(
                        `settings.${getLateFeePercentKey(reminderIndex)}`,
                        parseFloat(value) || 0
                      )
                    }
                  />
                </Element>
              </>
            ) : (
              <>
                <Element leftSide={t('send_email')}>
                  <Toggle
                    checked={Boolean(company?.settings.enable_reminder_endless)}
                    onValueChange={(value) =>
                      handleChange('settings.enable_reminder_endless', value)
                    }
                  />
                </Element>

                <Element leftSide={t('frequency')}>
                  <SelectField
                    value={
                      company?.settings.endless_reminder_frequency_id || ''
                    }
                    onValueChange={(value) =>
                      handleChange(
                        'settings.endless_reminder_frequency_id',
                        value
                      )
                    }
                    withBlank
                  >
                    {Object.keys(frequencies).map((frequency, index) => (
                      <option key={index} value={frequency}>
                        {t(frequencies[frequency as keyof typeof frequencies])}
                      </option>
                    ))}
                  </SelectField>
                </Element>
              </>
            )}
          </Card>
        )}

      {preview && (
        <Card className="scale-y-100" title={preview.subject}>
          {!isLoadingPdf ? (
            <iframe
              srcDoc={generateEmailPreview(preview.body, preview.wrapper)}
              frameBorder="0"
              width="100%"
              height={800}
              tabIndex={-1}
              loading="lazy"
            />
          ) : (
            <div
              className="flex justify-center items-center"
              style={{ height: 800 }}
            >
              <Spinner />
            </div>
          )}
        </Card>
      )}

      <Card title={t('variables')}>
        <Element leftSide={t('invoice')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.invoice.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('client')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.client.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('contact')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.contact.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('company')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.company.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>
      </Card>
    </Settings>
  );
}
