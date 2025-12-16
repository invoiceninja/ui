/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { endpoint } from '$app/common/helpers';
import { Design } from '$app/common/interfaces/design';

export function useExportCustomDesign() {
  const queryClient = useQueryClient();

  return (customDesign: Design) => {
    toast.processing();

    queryClient.fetchQuery(endpoint(`/api/v1/designs/${customDesign.id}`), () =>
      request(
        'GET',
        endpoint(`/api/v1/designs/${customDesign.id}`),
        {},
        { responseType: 'arraybuffer' }
      ).then((response) => {
        const blob = new Blob([response.data], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);

        const [, filename] =
          response.headers['content-disposition'].split('filename=');

        const link = document.createElement('a');

        link.download = filename;
        link.href = url;
        link.target = '_blank';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        toast.dismiss();
      })
    );
  };
}
