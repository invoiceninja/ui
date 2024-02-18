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
import { InputField, SelectField } from '$app/components/forms';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { generateEmailPreview } from '$app/common/helpers/emails/generate-email-preview';
import { useHandleSend } from '$app/common/hooks/emails/useHandleSend';
import { useResolveTemplate } from '$app/common/hooks/emails/useResolveTemplate';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Contact } from '$app/components/emails/Contact';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { MailerComponent } from '$app/pages/purchase-orders/email/Email';
import { forwardRef, RefObject, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isHosted, isSelfHosted } from '$app/common/helpers';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

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

  const [errors, setErrors] = useState<ValidationBag>();

  const [templateId, setTemplateId] = useState(props.defaultEmail);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const reactSettings = useReactSettings();

  const isCcEmailAvailable =
    isSelfHosted() || (isHosted() && (proPlan() || enterprisePlan()));

  const company = useCurrentCompany();

  const handleTemplateChange = (id: string) => {
    setSubject('');
    setBody('');
    setCcEmail('');
    setTemplateId(id);
  };

  const template = useResolveTemplate(
    body,
    props.resourceType,
    props.resource?.id || '',
    subject,
    templateId,
    ccEmail
  );

  const pdfUrl = useGeneratePdfUrl({
    resourceType: props.resourceType,
  });

  const handleSend = useHandleSend({ setErrors });

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
            props.redirectUrl,
            ccEmail
          );
        },
      };
    },
    [body, subject, templateId, ccEmail]
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
              errorMessage={errors?.errors.template}
            >
              {Object.entries(props.list).map(
                ([templateId, translation], index) => (
                  <option key={index} value={templateId}>
                    {t(translation)}
                  </option>
                )
              )}

              {company?.settings.email_subject_custom1 && (
                <option value="email_template_custom1">
                  {company?.settings.email_subject_custom1}
                </option>
              )}

              {company?.settings.email_subject_custom2 && (
                <option value="email_template_custom2">
                  {company?.settings.email_subject_custom2}
                </option>
              )}

              {company?.settings.email_subject_custom3 && (
                <option value="email_template_custom3">
                  {company?.settings.email_subject_custom3}
                </option>
              )}
            </SelectField>
          </Element>
        </Card>

        <Card withContainer>
          {isCcEmailAvailable && (
            <InputField
              label={t('cc_email')}
              value={ccEmail || template?.cc_email}
              onValueChange={(value) => setCcEmail(value)}
              errorMessage={errors?.errors.cc_email}
            />
          )}

          <InputField
            label={t('subject')}
            value={subject || template?.raw_subject}
            onValueChange={(value) => setSubject(value)}
            disabled={freePlan() && isHosted()}
            errorMessage={errors?.errors.subject}
          />

          {(proPlan() || enterprisePlan()) && (
            <MarkdownEditor
              value={body || template?.raw_body}
              onChange={(value) => setBody(String(value))}
            />
          )}
        </Card>

        {template && (
          <Card className="scale-y-100" title={template.subject}>
            <iframe
              srcDoc={generateEmailPreview(template.body, template.wrapper)}
              width="100%"
              height={800}
            />
          </Card>
        )}
      </div>

      <div className="my-4 lg:my-0 col-span-12 lg:col-span-7 h-max">
        {props.resource && reactSettings?.show_pdf_preview && (
          <InvoiceViewer method="GET" link={pdfUrl(props.resource) as string} />
        )}
      </div>
    </div>
  );
});
