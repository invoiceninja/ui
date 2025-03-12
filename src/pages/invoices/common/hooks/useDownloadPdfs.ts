/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';

interface Props {
  entity: 'invoice' | 'quote' | 'credit' | 'purchase_order';
}

export function useDownloadPdfs({ entity }: Props) {
  const queryClient = useQueryClient();

  return (resourceIds: string[]) => {
    if (!resourceIds.length) {
      return;
    }

    toast.processing();

    queryClient.fetchQuery([`/api/v1/${entity}s/bulk`], () =>
      request('POST', endpoint(`/api/v1/${entity}s/bulk`), {
        action: 'bulk_download',
        ids: resourceIds,
      }).then(() => toast.success('downloaded_entities'))
    );
  };
}
