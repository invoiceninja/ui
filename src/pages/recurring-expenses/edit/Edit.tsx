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
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useRecurringExpenseQuery } from '../common/queries';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { Tab, Tabs } from 'components/Tabs';
import { AdditionalInfo } from '../create/components/AdditionalInfo';
import { Details } from '../create/components/Details';
import { Notes } from '../create/components/Notes';
import { TaxSettings } from '../create/components/Taxes';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAtom } from 'jotai';
import { recurringExpenseAtom } from '../common/atoms';
import {
  useActions,
  useRecurringExpenseUtilities,
  useSave,
} from '../common/hooks';
import { ResourceActions } from 'components/ResourceActions';
import { cloneDeep } from 'lodash';

export function Edit() {
  const { documentTitle } = useTitle('recurring_expense');
  const { id } = useParams();
  const { data } = useRecurringExpenseQuery({ id: id! });

  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('recurring_expenses'), href: '/recurring_expenses' },
    {
      name: t('edit_recurring_expense'),
      href: route('/recurring_expenses/:id', { id }),
    },
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

  const [recurringExpense, setRecurringExpense] = useAtom(recurringExpenseAtom);
  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();
  const save = useSave({ setErrors });
  const actions = useActions();

  const { handleChange } = useRecurringExpenseUtilities();

  useEffect(() => {
    if (data) {
      const re = cloneDeep(data);
      setRecurringExpense(re);
    }
  }, [data]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      topRight={
        recurringExpense && (
          <ResourceActions
            resource={recurringExpense}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
      onBackClick="/recurring_expenses"
      onSaveClick={() => recurringExpense && save(recurringExpense)}
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Details
              expense={recurringExpense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              pageType="edit"
              errors={errors}
            />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <Notes expense={recurringExpense} handleChange={handleChange} />
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <AdditionalInfo
              expense={recurringExpense}
              handleChange={handleChange}
            />

            <TaxSettings
              expense={recurringExpense}
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
