/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useHandleSend() {
  const [t] = useTranslation();

  return (
    body: string,
    entity: string,
    entityId: string,
    subject: string,
    template: string
  ) => {
    const toastId = toast.loading(t('processing'));

    axios
      .post(
        endpoint('/api/v1/emails'),
        {
          body,
          entity,
          entity_id: entityId,
          subject,
          template,
        },
        { headers: defaultHeaders() }
      )
      .then(() => toast.success(t(`emailed_${entity}`), { id: toastId }))
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
