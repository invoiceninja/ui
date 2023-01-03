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
import { Button, InputField, Link, SelectField } from '@invoiceninja/forms';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { freePlan } from 'common/guards/guards/free-plan';
import { proPlan } from 'common/guards/guards/pro-plan';
import { endpoint, isHosted, isSelfHosted } from 'common/helpers';
import { generateEmailPreview } from 'common/helpers/emails/generate-email-preview';
import { request } from 'common/helpers/request';
import { EmailTemplate } from 'common/hooks/emails/useResolveTemplate';
import { useCurrentUser } from 'common/hooks/useCurrentUser';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Settings as CompanySettings } from 'common/interfaces/company.interface';
import { TemplateBody, Templates } from 'common/interfaces/statics';
import { useStaticsQuery } from 'common/queries/statics';
import { AdvancedSettingsPlanAlert } from 'components/AdvancedSettingsPlanAlert';
import { MarkdownEditor } from 'components/forms/MarkdownEditor';
import { Settings } from 'components/layouts/Settings';
import { useHandleCancel } from 'pages/invoices/edit/hooks/useHandleCancel';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { Variable } from './common/components/Variable';

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
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const handleSave = useHandleCompanySave();
  const handleCancel = useHandleCancel();
  const user = useCurrentUser();

  const { data: statics } = useStaticsQuery();
  const [templateId, setTemplateId] = useState('invoice');
  const [templateBody, setTemplateBody] = useState<TemplateBody>();
  const [preview, setPreview] = useState<EmailTemplate>();
  const canChangeEmailTemplate = (isHosted() && !freePlan()) || isSelfHosted();

  useEffect(() => {
    if (statics?.templates && company) {
      const existing = {
        subject: company.settings[
          `email_subject_${templateId}` as keyof CompanySettings
        ] as string,
        body: company.settings[
          `email_template_${templateId}` as keyof CompanySettings
        ] as string,
      };

      if (existing.subject?.length > 0 || existing.body?.length > 0) {
        setTemplateBody({ ...existing });
      } else {
        const template = statics.templates[templateId as keyof Templates] || {
          subject:
            company.settings[
              `email_subject_${templateId}` as keyof CompanySettings
            ],
          body: company.settings[
            `email_template_${templateId}` as keyof CompanySettings
          ],
        };

        setTemplateBody({ ...template });
      }
    }
  }, [statics, templateId]);

  useEffect(() => {
    handleChange(`settings.email_subject_${templateId}`, templateBody?.subject);
    handleChange(`settings.email_template_${templateId}`, templateBody?.body);

    request('POST', endpoint('/api/v1/templates'), {
      body: templateBody?.body,
      subject: templateBody?.subject,
      entity: '',
      entity_id: '',
      template: '',
    }).then((response) => setPreview(response.data));
  }, [templateBody]);

  const variables = {
    invoice: [
      '$amount',
      '$balance',
      '$date',
      '$due_date',
      '$footer',
      '$number',
      '$payment_url',
      '$po_number',
      '$terms',
      '$view_url',
      '$assigned_to_user',
      '$created_by_user',
      '$discount',
      '$exchange_rate',
      '$invoices',
      '$payment_button',
      '$payments',
      '$public_notes',
      '$view_button',
    ],
    client: [
      '$client_address1',
      '$client.city',
      '$client.credit_balance',
      '$client.name',
      '$client.postal_code',
      '$client.shipping_address1',
      '$client.shipping_city',
      '$client.shipping_postal_code',
      '$client.state',
      '$client.address2',
      '$client.country',
      '$client.id_number',
      '$client.phone',
      '$client.public_notes',
      '$client.shipping_address2',
      '$client.shipping_country',
      '$client.shipping_state',
      '$client.vat_number',
    ],
    contact: [
      '$contact.email',
      '$contact.first_name',
      '$contact.last_name',
      '$contact.phone',
    ],
    company: [
      '$company.address1',
      '$company.address2',
      '$company.country',
      '$company.email',
      '$company.id_number',
      '$company.name',
      '$company.phone',
      '$company.state',
      '$company.vat_number',
      '$company.website',
    ],
  };

  return (
    <Settings
      title={t('templates_and_reminders')}
      docsLink="docs/advanced-settings/#templates_and_reminders"
      breadcrumbs={pages}
      onSaveClick={handleSave}
      onCancelClick={handleCancel}
      disableSaveButton={!proPlan() && !enterprisePlan() && isHosted()}
    >
      {!proPlan() && !enterprisePlan() && isHosted() && (
        <AdvancedSettingsPlanAlert />
      )}

      <Card title={t('edit')}>
        <Element leftSide={t('template')}>
          <SelectField
            value={templateId}
            onValueChange={(value) => setTemplateId(value)}
          >
            {statics &&
              Object.keys(statics.templates).map((template, index) => (
                <option value={template} key={index}>
                  {t(template)}
                </option>
              ))}

            <option value="custom1">{t('first_custom')}</option>
            <option value="custom2">{t('second_custom')}</option>
            <option value="custom3">{t('third_custom')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('subject')}>
          <InputField
            id="subject"
            value={templateBody?.subject}
            onValueChange={(value) =>
              setTemplateBody(
                (current) => current && { ...current, subject: value }
              )
            }
          />
        </Element>

        <Element leftSide={t('body')}>
          {canChangeEmailTemplate ? (
            <MarkdownEditor
              value={templateBody?.body}
              onChange={(value) =>
                setTemplateBody(
                  (current) => current && { ...current, body: value }
                )
              }
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
              <Link
                className="mt-2"
                external
                to={user?.company_user?.ninja_portal_url || ''}
              >
                <Button>{t('plan_change')}</Button>
              </Link>
            </div>
          )}
        </Element>
      </Card>

      {preview && (
        <Card style={{ height: 800 }} title={preview.subject}>
          <iframe
            srcDoc={generateEmailPreview(preview.body, preview.wrapper)}
            frameBorder="0"
            width="100%"
            height={800}
          />
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
