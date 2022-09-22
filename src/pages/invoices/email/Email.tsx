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
import { useTitle } from 'common/hooks/useTitle';
import { useInvoiceQuery } from 'common/queries/invoices';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Mailer } from 'pages/invoices/email/components/Mailer';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_invoice');
  const { id } = useParams();

  const { data: invoice } = useInvoiceQuery({ id });

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
    <Default title={documentTitle} breadcrumbs={pages}>
      {invoice && (
        <Mailer
          resource={invoice}
          resourceType="invoice"
          list={list}
          defaultEmail="email_template_invoice"
        />
      )}
    </Default>
  );
}
