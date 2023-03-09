/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ActionCard } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { route } from '$app/common/helpers/route';
import { bulk, useTaskStatusQuery } from '$app/common/queries/task-statuses';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';

export function Archive() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data } = useTaskStatusQuery({ id });
  const queryClient = useQueryClient();

  const archive = () => {
    toast.loading(t('processing'));

    bulk([data?.data.data.id], 'archive')
      .then(() => {
        toast.dismiss();
        toast.success(t('archived_task_status'));
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.success(t('error_title'));
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/task_statuses/:id', { id })
        )
      );
  };

  return (
    <>
      {data && !data.data.data.archived_at && !data.data.data.is_deleted ? (
        <ActionCard label={t('archive')} help="">
          <Button onClick={archive}>{t('archive')}</Button>
        </ActionCard>
      ) : null}
    </>
  );
}
