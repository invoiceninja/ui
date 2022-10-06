/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import {
  MailerResource,
  MailerResourceType,
} from 'pages/invoices/email/components/Mailer';
import { useQueryClient } from 'react-query';
import { useGeneratePdfUrl } from './useGeneratePdfUrl';

interface Props {
  resource: MailerResourceType;
}

export function useDownloadPdf(props: Props) {
  const queryClient = useQueryClient();
  const url = useGeneratePdfUrl({ resourceType: props.resource });

  return (resource: MailerResource) => {
    const downloadableUrl = url(resource);

    if (downloadableUrl) {
      toast.processing();

      queryClient.fetchQuery(downloadableUrl, () =>
        request('GET', downloadableUrl, {}, { responseType: 'arraybuffer' })
          .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.download = `${props.resource}.pdf`;
            link.href = url;
            link.target = '_blank';

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            toast.dismiss();
          })
          .catch((error) => {
            console.error(error);
            
            toast.error();
          })
      );
    }
  };
}
