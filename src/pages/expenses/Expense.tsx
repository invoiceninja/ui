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
import { useExpenseQuery } from 'common/queries/expenses';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';

export function Expense() {
  const { documentTitle, setDocumentTitle } = useTitle('expense');
  const { id } = useParams();
  const { data: expense } = useExpenseQuery({ id });

  const [t] = useTranslation();

  useEffect(() => {
    expense && setDocumentTitle(`${t('expense')} ${expense.number}`);
  }, [expense]);

  const pages: BreadcrumRecord[] = [
    { name: t('expenses'), href: '/expenses' },
    { name: documentTitle, href: generatePath('/expenses/:id', { id }) },
  ];

  return (
    <Default title={documentTitle} breadcrumbs={pages}>
      <Outlet />
    </Default>
  );
}
