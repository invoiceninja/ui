/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { RecurringExpense } from 'common/interfaces/recurring-expense';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useRecurringExpenseQuery } from 'common/queries/recurring-expense';
import { Page } from 'components/Breadcrumbs';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Tab, Tabs } from 'components/Tabs';
import {
  useActions,
  useHandleChange,
} from 'pages/recurring-expenses/common/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { AdditionalInfo } from '../components/AdditionalInfo';
import { Details } from '../components/Details';
import { Notes } from '../components/Notes';
import { TaxSettings } from '../components/Taxes';

export function Edit() {
  const [t] = useTranslation();

  const { documentTitle } = useTitle('recurring_expense');

  const actions = useActions();

  const { id } = useParams();

  const { data } = useRecurringExpenseQuery({ id });

  const navigate = useNavigate();

  const queryClient = useQueryClient();

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

  const [recurringExpense, setRecurringExpense] = useState<RecurringExpense>();

  const [taxInputType, setTaxInputType] = useState<'by_rate' | 'by_amount'>(
    'by_rate'
  );

  const [errors, setErrors] = useState<ValidationBag>();

  const handleChange = useHandleChange({ setRecurringExpense, setErrors });

  useEffect(() => {
    if (data) {
      setRecurringExpense(data);
    }
  }, [data]);

  const handleSave = () => {
    toast.processing();

    setErrors(undefined);

    request(
      'PUT',
      endpoint('/api/v1/recurring_expenses/:id', { id: recurringExpense!.id }),
      recurringExpense
    )
      .then(() => {
        toast.success('updated_recurring_expense');

        queryClient.invalidateQueries(
          route('/api/v1/recurring_expenses/:id', { id: recurringExpense!.id })
        );

        navigate('/recurring_expenses');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          toast.error();
          console.error(error);
        }
      });
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onBackClick="/recurring_expenses"
      onSaveClick={() => recurringExpense && handleSave()}
      navigationTopRight={
        recurringExpense && (
          <ResourceActions
            resource={recurringExpense}
            label={t('more_actions')}
            actions={actions}
          />
        )
      }
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-4">
            <Details
              recurringExpense={recurringExpense}
              handleChange={handleChange}
              taxInputType={taxInputType}
              pageType="edit"
              errors={errors}
            />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <Notes
              recurringExpense={recurringExpense}
              handleChange={handleChange}
            />
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-4">
            <AdditionalInfo
              recurringExpense={recurringExpense}
              handleChange={handleChange}
            />

            <TaxSettings
              recurringExpense={recurringExpense}
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
