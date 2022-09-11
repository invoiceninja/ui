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
import { Expense } from 'common/interfaces/expense';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useExpenseQuery } from 'common/queries/expenses';
import { Page } from 'components/Breadcrumbs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router-dom';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { TaxSettings } from '../create/components/Taxes';
import { useBulk } from './hooks/useBulk';
import { useSave } from './hooks/useSave';

export function Edit() {
  const { documentTitle } = useTitle('expense');
  const { id } = useParams();
  const { data } = useExpenseQuery({ id });

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('expenses'), href: '/expenses' },
    { name: t('edit_expense'), href: generatePath('/expenses/:id', { id }) },
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

  const [expense, setExpense] = useState<Expense>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const bulk = useBulk();
  const save = useSave({ setErrors });

  const handleChange = <T extends keyof Expense>(
    property: T,
    value: Expense[typeof property]
  ) => {
    setExpense((expense) => expense && { ...expense, [property]: value });
  };

  useEffect(() => {
    if (data) {
      setExpense(data);
    }
  }, [data]);

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
      onBackClick={generatePath('/expenses')}
      onSaveClick={() => expense && save(expense)}
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Details
              expense={expense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              pageType="edit"
              errors={errors}
            />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <Notes expense={expense} handleChange={handleChange} />
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <AdditionalInfo expense={expense} handleChange={handleChange} />

            <TaxSettings
              expense={expense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              setTaxInputType={setTaxInputType}
            />
          </div>
        </div>
      </div>
    </Default>
  );
}
