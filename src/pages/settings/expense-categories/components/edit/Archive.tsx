/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ActionCard } from '@invoiceninja/cards';
import { Button } from '@invoiceninja/forms';
import {
  bulk,
  useExpenseCategoryQuery,
} from 'common/queries/expense-categories';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useParams } from 'react-router-dom';

export function Archive() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data } = useExpenseCategoryQuery({ id });
  const queryClient = useQueryClient();

  const archive = () => {
    toast.loading(t('processing'));

    bulk([data?.data.data.id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_expense_category'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/expense_categories/:id', { id })
        )
      );
  };

  return (
    <>
      {data && !data.data.data.archived_at && !data.data.data.is_deleted ? (
        <ActionCard label={t('archive')} help="Lorem ipsum dolor sit amet.">
          <Button onClick={archive}>{t('archive')}</Button>
        </ActionCard>
      ) : null}
    </>
  );
}
