/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useTitle } from '$app/common/hooks/useTitle';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Mailer } from '$app/pages/invoices/email/components/Mailer';
import { MailerComponent } from '$app/pages/purchase-orders/email/Email';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_invoice');
  const { id } = useParams();

  const { data: invoice } = useInvoiceQuery({ id });

  const mailerRef = useRef<MailerComponent>(null);

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

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      saveButtonLabel={t('send_email')}
      onSaveClick={() => mailerRef?.current?.sendEmail()}
    >
      {invoice && (
        <Mailer
          ref={mailerRef}
          resource={invoice}
          resourceType="invoice"
          list={list}
          defaultEmail="email_template_invoice"
          redirectUrl="/invoices"
        />
      )}
    </Default>
  );
}
