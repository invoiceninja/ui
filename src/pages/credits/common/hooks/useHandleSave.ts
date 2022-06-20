/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { updateRecord } from 'common/stores/slices/company-users';
import { request } from 'common/helpers/request';
import { Credit } from 'common/interfaces/credit';
import { setCurrentCredit } from 'common/stores/slices/credits/extra-reducers/set-current-credit';

export function useHandleSave() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const company = useInjectCompanyChanges();

  return (id: string, credit: Credit) => {
    const toastId = toast.loading(t('processing'));

    const _credit: Partial<Credit> = { ...credit };

    delete _credit.documents;

    axios
      .all([
        request('PUT', endpoint('/api/v1/credits/:id', { id }), _credit),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success(t('updated_credit'), { id: toastId });
        dispatch(setCurrentCredit(response[0].data.data));

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );
      })
      .catch((error) => {
        console.error(error);

        toast.error(t('error_title'), { id: toastId });
      })
      .finally(() =>
        queryClient.invalidateQueries(
          generatePath('/api/v1/credits/:id', { id })
        )
      );
  };
}
