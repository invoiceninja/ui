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

export function Archive(props: Props) {
  const queryClient = useQueryClient();
  const [t] = useTranslation();

  const archive = () => {
    const toastId = toast.loading(t('processing'));

    bulk([props.id as string], 'archive')
      .then(() => toast.success(t('archived_product'), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() => queryClient.invalidateQueries(props.endpoint));
  };

  return (
    <ActionCard label={t('archive')} help="Lorem ipsum dolor sit amet.">
      <Button onClick={archive}>{t('archive')}</Button>
    </ActionCard>
  );
}
