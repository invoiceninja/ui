/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useMakeTemplate() {
  const navigate = useNavigate();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const makeTemplate = (document: Document) => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      request(
        'POST',
        docuNinjaEndpoint('/api/documents/:id/action', { id: document.id }),
        {
          action: 'make_template',
          id: document.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then((response) => {
          $refetch(['docuninja_documents', 'blueprints']);

          toast.success('template_created');

          navigate(
            route('/documents/templates/:id/edit', {
              id: response.data.data?.id,
            })
          );
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.error(error.response?.data.message ?? 'something_went_wrong');
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return { makeTemplate, isFormBusy };
}
