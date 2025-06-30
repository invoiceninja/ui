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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Contact } from '$app/components/emails/Contact';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '$app/pages/invoices/common/hooks/useGeneratePdfUrl';
import { MailerComponent } from '$app/pages/purchase-orders/email/Email';
import {
  forwardRef,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { request } from '$app/common/helpers/request';
import { cloneDeep } from 'lodash';
import { toast } from '$app/common/helpers/toast/toast';

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

export interface EmailTemplate {
  subject: string;
  body: string;
  wrapper: string;
  raw_body: string;
  raw_subject: string;
  cc_email: string;
}

export const Mailer = forwardRef<MailerComponent, Props>((props, ref) => {
  const [t] = useTranslation();

  const company = useCurrentCompany();
  const reactSettings = useReactSettings();

  const pdfUrl = useGeneratePdfUrl({
    resourceType: props.resourceType,
  });

  const controllerRef = useRef<AbortController | null>(null);

  const [errors, setErrors] = useState<ValidationBag>();
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>();
  const [triggerTemplateGeneration, setTriggerTemplateGeneration] =
    useState<boolean>(true);

  const handleSend = useHandleSend({ setErrors });

  const [payloadData, setPayloadData] = useState({
    body: '',
    ccEmail: '',
    subject: '',
    templateId: props.defaultEmail,
  });

  const isCcEmailAvailable =
    isSelfHosted() || (isHosted() && (proPlan() || enterprisePlan()));

  const handleTemplateChange = (id: string) => {
    setPayloadData(
      cloneDeep({
        body: '',
        ccEmail: '',
        subject: '',
        templateId: id,
      })
    );

    setTriggerTemplateGeneration(true);
  };

  useEffect(() => {
    if (triggerTemplateGeneration) {
      setTriggerTemplateGeneration(false);

      toast.processing();

      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      controllerRef.current = new AbortController();

      request(
        'POST',
        endpoint('/api/v1/templates'),
        {
          body: payloadData.body,
          entity: props.resourceType,
          entity_id: props.resource?.id || '',
          subject: payloadData.subject,
          template: payloadData.templateId,
          cc_email: payloadData.ccEmail,
        },
        {
          signal: controllerRef.current
            ? controllerRef.current.signal
            : undefined,
        }
      ).then((response) => {
        toast.dismiss();
        setCurrentTemplate(response.data);
      });
    }
  }, [triggerTemplateGeneration, props.resourceType, props.resource?.id]);

  useEffect(() => {
    if (currentTemplate) {
      setPayloadData((current) => ({
        ...current,
        subject: currentTemplate.raw_subject,
        body: currentTemplate.raw_body,
        ccEmail: currentTemplate.cc_email,
      }));
    }
  }, [currentTemplate]);

  useImperativeHandle(
    ref,
    () => {
      return {
        sendEmail() {
          handleSend(
            payloadData.body,
            props.resourceType,
            props.resource?.id || '',
            payloadData.subject,
            payloadData.templateId,
            props.redirectUrl,
            payloadData.ccEmail
          );
        },
      };
    },
    [payloadData]
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
              defaultValue={payloadData.templateId}
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
              value={payloadData.ccEmail}
              onValueChange={(value) =>
                setPayloadData((current) => ({ ...current, ccEmail: value }))
              }
              errorMessage={errors?.errors.cc_email}
            />
          )}

          <InputField
            label={t('subject')}
            value={payloadData.subject}
            onValueChange={(value) => {
              setPayloadData((current) => ({ ...current, subject: value }));

              setTriggerTemplateGeneration(true);
            }}
            disabled={freePlan() && isHosted()}
            changeOverride
            errorMessage={errors?.errors.subject}
          />

          {(proPlan() || enterprisePlan()) && (
            <MarkdownEditor
              value={payloadData.body}
              onChange={(value) => {
                setPayloadData((current) => ({ ...current, body: value }));

                setTriggerTemplateGeneration(true);
              }}
              handleChangeOnlyOnUserInput
            />
          )}
        </Card>

        {currentTemplate && (
          <Card className="scale-y-100" title={currentTemplate.subject}>
            <iframe
              srcDoc={generateEmailPreview(
                currentTemplate.body,
                currentTemplate.wrapper
              )}
              width="100%"
              height={800}
              tabIndex={-1}
              loading="lazy"

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
