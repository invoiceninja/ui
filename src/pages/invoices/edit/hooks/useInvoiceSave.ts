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
import { Invoice } from 'common/interfaces/invoice';
import { defaultHeaders } from 'common/queries/common/headers';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { generatePath } from 'react-router-dom';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { updateRecord } from 'common/stores/slices/company-users';

export function useInvoiceSave() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const company = useInjectCompanyChanges();

  return (id: string, invoice: Invoice) => {
    const toastId = toast.loading(t('processing'));

    axios.all([
      axios.put(endpoint('/api/v1/invoices/:id', { id }), invoice, {
      headers: defaultHeaders(),
    }),
      axios.put(
        endpoint('/api/v1/companies/:id', { id: company?.id }),
        company,
        { headers: defaultHeaders() }
      ),
    ]).then((response) => {
        toast.success(t('updated_invoice'), { id: toastId });
        dispatch(setCurrentInvoice(response[0].data.data));

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
          generatePath('/api/v1/invoices/:id', { id })
        )
      );
  };
}
