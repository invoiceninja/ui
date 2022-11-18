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
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Mailer } from 'pages/invoices/email/components/Mailer';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuoteQuery } from '../common/queries';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_quote');
  const { id } = useParams();

  const { data: quote } = useQuoteQuery({ id: id! });

  const list = {
    email_template_quote: 'initial_email',
  };

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('email_quote'),
      href: route('/quotes/:id/email', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {quote && (
        <Mailer
          resource={quote}
          resourceType="quote"
          list={list}
          defaultEmail="email_template_quote"
          redirectUrl="/quotes"
        />
      )}
    </Default>
  );
}
