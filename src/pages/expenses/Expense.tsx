/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import { useTitle } from 'common/hooks/useTitle';
import { useExpenseQuery } from 'common/queries/expenses';
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Dropdown } from 'components/dropdown/Dropdown';
import { Inline } from 'components/Inline';
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

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        <Inline>
          <Button to={generatePath('/expenses/:id/edit', { id })}>
            {t('edit_expense')}
          </Button>

          <Dropdown label={t('more_actions')}>
            {/* <DropdownElement>A</DropdownElement>
            <DropdownElement>B</DropdownElement> */}
          </Dropdown>
        </Inline>
      }
    >
      <Container>
        <Tabs tabs={tabs} />

        <Outlet />
      </Container>
    </Default>
  );
}
