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
import { Button, InputField, SelectField } from '@invoiceninja/forms';
import MDEditor from '@uiw/react-md-editor';
import { generateEmailPreview } from 'common/helpers/emails/generate-email-preview';
import { useHandleSend } from 'common/hooks/emails/useHandleSend';
import { useResolveTemplate } from 'common/hooks/emails/useResolveTemplate';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Invoice } from 'common/interfaces/invoice';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { Contact } from 'components/emails/Contact';
import { InvoiceViewer } from 'pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from 'pages/invoices/common/hooks/useGeneratePdfUrl';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  resource: Invoice | RecurringInvoice | Quote;
  resourceType: 'invoice' | 'recurring_invoice' | 'quote';
  list: Record<string, string>;
  defaultEmail: string;
}

export function Mailer(props: Props) {
  const [t] = useTranslation();

  const [templateId, setTemplateId] = useState(props.defaultEmail);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const company = useCurrentCompany();

  const handleTemplateChange = (id: string) => {
    setSubject('');
    setBody('');
    setTemplateId(id);
  };

  const template = useResolveTemplate(
    body,
    props.resourceType,
    props.resource?.id || '',
    subject,
    templateId
  );

  const pdfUrl = useGeneratePdfUrl({ resource: props.resourceType });

  const handleSend = useHandleSend();

  return (
    <>
      <div className="flex justify-end">
        <Button
          onClick={() =>
            handleSend(
              body,
              props.resourceType,
              props.resource?.id || '',
              subject,
              templateId
            )
          }
        >
          {t('send_email')}
        </Button>
      </div>

      <div className="grid grid-cols-12 lg:gap-4 my-4">
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card>
            <Element leftSide={t('to')}>
              {props.resource?.invitations.map((invitation, index) => (
                <Contact
                  key={index}
                  contactId={invitation.client_contact_id}
                  clientId={props.resource.client_id}
                />
              ))}
            </Element>

            <Element leftSide={t('template')}>
              <SelectField
                defaultValue={templateId}
                onValueChange={(value) => handleTemplateChange(value)}
              >
                {Object.entries(props.list).map(
                  ([templateId, translation], index) => (
                    <option key={index} value={templateId}>
                      {t(translation)}
                    </option>
                  )
                )}

                {company?.settings.email_template_custom1 && (
                  <option value="email_template_custom1">
                    {company?.settings.email_subject_custom1}
                  </option>
                )}

                {company?.settings.email_template_custom2 && (
                  <option value="email_template_custom2">
                    {company?.settings.email_subject_custom2}
                  </option>
                )}

                {company?.settings.email_template_custom3 && (
                  <option value="email_template_custom3">
                    {company?.settings.email_subject_custom3}
                  </option>
                )}
              </SelectField>
            </Element>
          </Card>

          <Card withContainer>
            <InputField
              label={t('subject')}
              value={subject || template?.raw_subject}
              onValueChange={(value) => setSubject(value)}
            />

            <MDEditor
              value={body || template?.raw_body}
              onChange={(value) => setBody(String(value))}
              preview="edit"
            />
          </Card>

          {template && (
            <Card style={{ height: 800 }} title={template.subject}>
              <iframe
                srcDoc={generateEmailPreview(template.body, template.wrapper)}
                frameBorder="0"
                width="100%"
                height={800}
              />
            </Card>
          )}
        </div>

        <div className="col-span-12 lg:col-span-7 bg-blue-300 h-max">
          {props.resource && (
            <InvoiceViewer
              method="GET"
              link={pdfUrl(props.resource) as string}
            />
          )}
        </div>
      </div>
    </>
  );
}
