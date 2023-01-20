/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { useHandleSend } from 'common/hooks/emails/useHandleSend';
import { useTitle } from 'common/hooks/useTitle';
import { useInvoiceQuery } from 'common/queries/invoices';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Mailer } from 'pages/invoices/email/components/Mailer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_invoice');
  const { id } = useParams();

  const { data: invoice } = useInvoiceQuery({ id });

  const [templateId, setTemplateId] = useState<string>(
    'email_template_invoice'
  );
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');

  const list = {
    email_template_invoice: 'initial_email',
    email_template_reminder1: 'first_reminder',
    email_template_reminder2: 'second_reminder',
    email_template_reminder3: 'third_reminder',
  };

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    {
      name: t('email_invoice'),
      href: route('/invoices/:id/email', { id }),
    },
  ];

  const handleSend = useHandleSend();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      disableSaveButton={!invoice}
      saveButtonLabel={t('send_email')}
      onSaveClick={() =>
        invoice &&
        handleSend(
          body,
          'invoice',
          invoice.id,
          subject,
          templateId,
          '/invoices'
        )
      }
    >
      {invoice && (
        <Mailer
          resource={invoice}
          resourceType="invoice"
          list={list}
          body={body}
          setBody={setBody}
          subject={subject}
          setSubject={setSubject}
          templateId={templateId}
          setTemplateId={setTemplateId}
        />
      )}
    </Default>
  );
}
