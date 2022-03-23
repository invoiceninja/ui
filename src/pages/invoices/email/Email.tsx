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
import { useTitle } from 'common/hooks/useTitle';
import { Default } from 'components/layouts/Default';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';
import { InvoiceViewer } from '../common/components/InvoiceViewer';
import { useGeneratePdfUrl } from '../common/hooks/useGeneratePdfUrl';
import { useResolveCurrentInvoice } from '../common/hooks/useResolveCurrentInvoice';
import { Contact } from './components/Contact';
import { useResolveTemplate } from './hooks/useResolveTemplate';

export function Email() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('send_email');
  const invoice = useResolveCurrentInvoice();
  const [templateId, setTemplateId] = useState('email_template_invoice');
  const template = useResolveTemplate(templateId, 'invoice', invoice?.id || '');
  const pdfUrl = useGeneratePdfUrl();

  return (
    <Default
      title={documentTitle}
      onBackClick={generatePath('/invoices')}
      onSaveClick={() => {}}
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
                  setTemplateId(event.target.value)
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
              </SelectField>
            </Element>
          </Card>

          <Card withContainer>
            <InputField label={t('subject')} value={template?.raw_subject} />

            <InputField
              label={t('body')}
              element="textarea"
              value={template?.raw_body}
            />
          </Card>

          <Card>
            <span className="text-sm uppercase text-center block">
              Preview goes here
            </span>
          </Card>
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
