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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function useHandleSend() {
  const [t] = useTranslation();
  const navigate = useNavigate();

  return (
    body: string,
    entity: string,
    entityId: string,
    subject: string,
    template: string,
    redirectUrl: string
  ) => {
    const toastId = toast.loading(t('processing'));

    request('POST', endpoint('/api/v1/emails'), {
      body,
      entity,
      entity_id: entityId,
      subject,
      template,
    })
      .then(() => {
        toast.success(t(`emailed_${entity}`), { id: toastId });

        navigate(redirectUrl);
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      });
  };
}
