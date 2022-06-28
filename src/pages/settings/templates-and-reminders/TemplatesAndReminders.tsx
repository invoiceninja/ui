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
import { endpoint } from 'common/helpers';
import { generateEmailPreview } from 'common/helpers/emails/generate-email-preview';
import { request } from 'common/helpers/request';
import { EmailTemplate } from 'common/hooks/emails/useResolveTemplate';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { useTitle } from 'common/hooks/useTitle';
import { Settings as CompanySettings } from 'common/interfaces/company.interface';
import { TemplateBody, Templates } from 'common/interfaces/statics';
import { useStaticsQuery } from 'common/queries/statics';
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

  const { data: statics } = useStaticsQuery();
  const [templateId, setTemplateId] = useState('invoice');
  const [templateBody, setTemplateBody] = useState<TemplateBody>();
  const [preview, setPreview] = useState<EmailTemplate>();

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

      if (existing.subject.length > 0 || existing.body.length > 0) {
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
  };

  return (
    <Settings
      title={t('templates_and_reminders')}
      breadcrumbs={pages}
      docsLink="docs/advanced-settings/#templates_and_reminders"
      onSaveClick={handleSave}
      onCancelClick={handleCancel}
    >
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
                templateBody && { ...templateBody, subject: value }
              )
            }
          />
        </Element>

        <Element leftSide={t('body')}>
          <InputField
            element="textarea"
            value={templateBody?.body}
            onValueChange={(value) =>
              setTemplateBody(templateBody && { ...templateBody, body: value })
            }
          />
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
      </Card>
    </Settings>
  );
}
