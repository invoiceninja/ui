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
import { useCreditQuery } from 'common/queries/credits';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Mailer } from 'pages/invoices/email/components/Mailer';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';

export function Email() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('email_credit');
  const { id } = useParams();

  const { data: credit } = useCreditQuery({ id });

  const list = {
    email_template_credit: 'initial_email',
  };

  const pages: BreadcrumRecord[] = [
    { name: t('credits'), href: '/credits' },
    {
      name: t('email_credit'),
      href: generatePath('/credits/:id/email', { id }),
    },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      {credit && (
        <Mailer
          resource={credit.data.data}
          resourceType="credit"
          list={list}
          defaultEmail="email_template_credit"
        />
      )}
    </Default>
  );
}
