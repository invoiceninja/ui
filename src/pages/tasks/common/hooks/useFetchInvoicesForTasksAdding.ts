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
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { Task } from '$app/common/interfaces/task';
import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';
import { useSetAtom } from 'jotai';
import { tasksToAddOnInvoiceAtom } from '../components/AddTasksOnInvoiceModal';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setInvoices: Dispatch<SetStateAction<Invoice[]>>;
  setIsAddTasksOnInvoiceVisible: Dispatch<SetStateAction<boolean>>;
}

export function useFetchInvoicesForTasksAdding(params: Params) {
  const queryClient = useQueryClient();

  const setTasksToAddOnInvoice = useSetAtom(tasksToAddOnInvoiceAtom);

  const { setInvoices, setIsAddTasksOnInvoiceVisible } = params;

  return (tasks: Task[]) => {
    toast.processing();

    queryClient.fetchQuery(
      route(
        '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
        {
          clientId: tasks[0].client_id,
        }
      ),
      () =>
        request(
          'GET',
          endpoint(
            '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
            {
              clientId: tasks[0].client_id,
            }
          )
        )
          .then((response: GenericSingleResourceResponse<Invoice[]>) => {
            toast.dismiss();

            if (!response.data.data.length) {
              return toast.error('no_invoices_found');
            }

            setInvoices(response.data.data);

            setTasksToAddOnInvoice(tasks);

            setIsAddTasksOnInvoiceVisible(true);
          })
          .catch((error: AxiosError) => {
            toast.error();
            console.error(error);
          })
    );
  };
}
