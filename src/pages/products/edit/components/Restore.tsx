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
import { bulk } from 'common/queries/products';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface Props {
  id: string;
  endpoint: string;
}

export function Restore(props: Props) {
  const queryClient = useQueryClient();
  const [t] = useTranslation();

  const restore = () => {
    const toastId = toast.loading(t('processing'));

    bulk([props.id as string], 'restore')
      .then(() => toast.success(t('restored_product'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() => queryClient.invalidateQueries(props.endpoint));
  };

  return (
    <ActionCard label={t('restore')} help="Lorem ipsum dolor sit amet.">
      <Button onClick={restore}>{t('restore')}</Button>
    </ActionCard>
  );
}
