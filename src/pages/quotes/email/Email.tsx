/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { useQuoteQuery } from 'common/queries/quotes';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Mailer } from 'pages/invoices/email/components/Mailer';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_quote');
  const { id } = useParams();

  const { data: quote } = useQuoteQuery({ id });

  const list = {
    email_template_quote: 'initial_email',
  };

  const pages: BreadcrumRecord[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('email_quote'),
      href: generatePath('/quotes/:id/email', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {quote && (
        <Mailer
          resource={quote.data.data}
          resourceType="quote"
          list={list}
          defaultEmail="email_template_quote"
        />
      )}
    </Default>
  );
}
