/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringExpenseStatus } from 'common/enums/recurring-expense-status';
import { route } from 'common/helpers/route';
import { useTitle } from 'common/hooks/useTitle';
import { RecurringExpense } from 'common/interfaces/recurring-expenses';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useRecurringExpenseQuery } from '../common/queries';
import { Page } from 'components/Breadcrumbs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { TaxSettings } from '../create/components/Taxes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useBulk } from './hooks/useBulk';
import { useSave } from './hooks/useSave';
import { useToggleStartStop } from './hooks/useToggleStartStop';

export function Edit() {
  const { documentTitle } = useTitle('recurring_expense');
  const { id } = useParams();
  const { data } = useRecurringExpenseQuery({ id });

  const [t] = useTranslation();
  const toggleStartStop = useToggleStartStop();

  const pages: Page[] = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    { name: t('edit_recurring_expense'), href: route('/recurring_expenses/:id', { id }) },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/recurring_expenses/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/recurring_expenses/:id/documents', { id }),
    },
  ];

  const [expense, setExpense] = useState<RecurringExpense>();
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const bulk = useBulk();
  const save = useSave({ setErrors });

  const handleChange = <T extends keyof RecurringExpense>(
    property: T,
    value: RecurringExpense[typeof property]
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
              {
                (expense.status_id === RecurringExpenseStatus.DRAFT ||
                  expense.status_id === RecurringExpenseStatus.PAUSED) && (
                  <DropdownElement
                    onClick={() => toggleStartStop(expense, 'start')}
                  >
                    {t('start')}
                  </DropdownElement>
                )}
              {
                expense.status_id === RecurringExpenseStatus.ACTIVE && (
                  <DropdownElement
                    onClick={() => toggleStartStop(expense, 'stop')}
                  >
                    {t('stop')}
                  </DropdownElement>
                )}
            </div>
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
                to={route('/expenses/:id/clone', { id: expense.id })}
              >
                {t('clone_to_expense')}
              </DropdownElement>
              <DropdownElement
                to={route('/recurring_expenses/:id/recurring_clone', { id: expense.id })}
              >
                {t('clone_to_recurring')}
              </DropdownElement>
            </div>
          </Dropdown>
        )
      }
      onBackClick={route('/recurring_expenses')}
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
