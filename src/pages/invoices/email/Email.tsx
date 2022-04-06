/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '@invoiceninja/cards';
import { InputField, SelectField } from '@invoiceninja/forms';
import { generateEmailPreview } from 'common/helpers/emails/generate-email-preview';
import { useTitle } from 'common/hooks/useTitle';
import { Default } from 'components/layouts/Default';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { InvoiceViewer } from '../common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '../common/hooks/useGeneratePdfUrl';
import { useResolveCurrentInvoice } from '../common/hooks/useResolveCurrentInvoice';
import { useHandleSend } from '../../../common/hooks/emails/useHandleSend';
import { useResolveTemplate } from 'common/hooks/emails/useResolveTemplate';
import { Contact } from 'components/emails/Contact';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import MDEditor from '@uiw/react-md-editor';

export function Email() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('email_invoice');
  const { id } = useParams();

  const pages: BreadcrumRecord[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('email_invoice'),
      href: generatePath('/invoices/:id/email', { id }),
    },
  ];

  const invoice = useResolveCurrentInvoice();
  const company = useCurrentCompany();

  const [templateId, setTemplateId] = useState('email_template_invoice');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const template = useResolveTemplate(
    body,
    'invoice',
    invoice?.id || '',
    subject,
    templateId
  );

  const pdfUrl = useGeneratePdfUrl();

  const handleTemplateChange = (id: string) => {
    setSubject('');
    setBody('');
    setTemplateId(id);
  };

  const handleSend = useHandleSend();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick={generatePath('/invoices')}
      onSaveClick={() =>
        handleSend(body, 'invoice', invoice?.id || '', subject, templateId)
      }
      saveButtonLabel={t('send')}
    >
      <div className="grid grid-cols-12 lg:gap-4">
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card>
            <Element leftSide={t('to')}>
              {invoice?.invitations.map((invitation, index) => (
                <Contact
                  key={index}
                  contactId={invitation.client_contact_id}
                  clientId={invoice.client_id}
                />
              ))}
            </Element>

            <Element leftSide={t('template')}>
              <SelectField
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  handleTemplateChange(event.target.value)
                }
              >
                <option value="email_template_invoice">
                  {t('initial_email')}
                </option>

                <option value="email_template_reminder1">
                  {t('first_reminder')}
                </option>

                <option value="email_template_reminder2">
                  {t('second_reminder')}
                </option>

                <option value="email_template_reminder3">
                  {t('third_reminder')}
                </option>

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
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSubject(event.target.value)
              }
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
          {invoice && (
            <InvoiceViewer method="GET" link={pdfUrl(invoice) as string} />
          )}
        </div>
      </div>
    </Default>
  );
}
