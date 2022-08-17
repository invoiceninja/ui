/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useTitle } from 'common/hooks/useTitle';
import { useExpenseQuery } from 'common/queries/expenses';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { InfoCard } from 'components/InfoCard';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
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

  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <Dropdown label={t('more_actions')}>
          {/* <DropdownElement>A</DropdownElement>
            <DropdownElement>B</DropdownElement> */}
        </Dropdown>
      }
    >
      <div className="grid grid-cols-12">
        <InfoCard className="col-span-12 xl:col-span-3" title={t('amount')}>
          {formatMoney(
            expense?.amount || 0,
            company?.settings.country_id,
            company.settings.currency_id
          )}
        </InfoCard>
      </div>

      <div className="mt-4 space-y-4">
        <Tabs tabs={tabs} />
        <Outlet />
      </div>
    </Default>
  );
}
