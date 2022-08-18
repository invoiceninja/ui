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
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Outlet, useParams } from 'react-router-dom';
import { useBulk } from './edit/hooks/useBulk';

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

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: generatePath('/expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: generatePath('/expenses/:id/documents', { id }),
    },
  ];

  const bulk = useBulk();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        expense && (
          <Dropdown label={t('more_actions')} className="divide-y">
            <div>
              {expense.archived_at === 0 && (
                <DropdownElement onClick={() => bulk([expense.id], 'archive')}>
                  {t('archive')}
                </DropdownElement>
              )}

              {expense.archived_at > 0 && (
                <DropdownElement onClick={() => bulk([expense.id], 'restore')}>
                  {t('restore')}
                </DropdownElement>
              )}

              {!expense.is_deleted && (
                <DropdownElement onClick={() => bulk([expense.id], 'delete')}>
                  {t('delete')}
                </DropdownElement>
              )}
            </div>

            <div>
              <DropdownElement
                to={generatePath('/expenses/:id/clone', { id: expense.id })}
              >
                {t('clone_to_expense')}
              </DropdownElement>
              {/* <DropdownElement>{t('clone_to_recurring')}</DropdownElement> */}
            </div>
          </Dropdown>
        )
      }
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />
        <Outlet />
      </div>
    </Default>
  );
}
