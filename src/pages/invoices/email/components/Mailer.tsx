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
import MDEditor from '@uiw/react-md-editor';
import { usePlan } from 'common/guards/guards/free-plan';
import { generateEmailPreview } from 'common/helpers/emails/generate-email-preview';
import { useHandleSend } from 'common/hooks/emails/useHandleSend';
import { useResolveTemplate } from 'common/hooks/emails/useResolveTemplate';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Invoice } from 'common/interfaces/invoice';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { Contact } from 'components/emails/Contact';
import { InvoiceViewer } from 'pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from 'pages/invoices/common/hooks/useGeneratePdfUrl';
import { MailerComponent } from 'pages/purchase-orders/email/Email';
import { forwardRef, RefObject, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type MailerResourceType =
  | 'invoice'
  | 'recurring_invoice'
  | 'quote'
  | 'credit'
  | 'purchase_order';

export type MailerResource = Invoice | RecurringInvoice | Quote | PurchaseOrder;

export type MailerContactProperty = 'client_id' | 'vendor_id';
interface Props {
  ref: RefObject<HTMLInputElement | undefined>;
  resource: MailerResource;
  resourceType: MailerResourceType;
  list: Record<string, string>;
  defaultEmail: string;
  redirectUrl: string;
}

export const Mailer = forwardRef<MailerComponent, Props>((props, ref) => {
  const [t] = useTranslation();

  const [templateId, setTemplateId] = useState(props.defaultEmail);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const company = useCurrentCompany();
  const { proPlan, freePlan, enterprisePlan } = usePlan();

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

  const pdfUrl = useGeneratePdfUrl({
    resourceType: props.resourceType,
  });

  const handleSend = useHandleSend();

  useImperativeHandle(
    ref,
    () => {
      return {
        sendEmail() {
          handleSend(
            body,
            props.resourceType,
            props.resource?.id || '',
            subject,
            templateId,
            props.redirectUrl
          );
        },
      };
    },
    [body, subject, templateId]
  );

  return (
    <div className="grid grid-cols-12 lg:gap-4 my-4">
      <div className="col-span-12 lg:col-span-5 space-y-4">
        <Card>
          <Element leftSide={t('to')}>
            <Contact
              resource={props.resource}
              resourceType={props.resourceType}
            />
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
            disabled={freePlan}
          />

          {(proPlan || enterprisePlan) && (
            <MDEditor
              value={body || template?.raw_body}
              onChange={(value) => setBody(String(value))}
              preview="edit"
            />
          )}
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
          <InvoiceViewer method="GET" link={pdfUrl(props.resource) as string} />
        )}
      </div>
    </div>
  );
});
