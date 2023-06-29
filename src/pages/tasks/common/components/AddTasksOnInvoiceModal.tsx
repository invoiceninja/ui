/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Task } from '$app/common/interfaces/task';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useAddTasksOnInvoice } from '../hooks/useAddTasksOnInvoice';
import { Invoice } from '$app/common/interfaces/invoice';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { AxiosError } from 'axios';
import { request } from '$app/common/helpers/request';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { Spinner } from '$app/components/Spinner';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  tasks: Task[];
  clientId: string;
}

export function AddTasksOnInvoiceModal(props: Props) {
  const { visible, setVisible, tasks, clientId } = props;

  const queryClient = useQueryClient();

  const formatMoney = useFormatMoney();

  const addTasksOnInvoice = useAddTasksOnInvoice({ tasks });

  const [invoices, setInvoices] = useState<Invoice[]>();

  useEffect(() => {
    if (visible) {
      queryClient.fetchQuery(
        route(
          '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
          {
            clientId,
          }
        ),
        () =>
          request(
            'GET',
            endpoint(
              '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
              {
                clientId,
              }
            )
          )
            .then((response: GenericSingleResourceResponse<Invoice[]>) => {
              if (!response.data.data.length) {
                return toast.error('no_invoices_found');
              }

              setInvoices(response.data.data);
            })
            .catch((error: AxiosError) => {
              toast.error();
              console.error(error);
            })
      );
    }
  }, [clientId, visible]);

  return (
    <Modal
      title={trans('add_to_invoice', { invoice: '' })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <div className="flex flex-col overflow-y-auto max-h-96">
        {invoices?.map((invoice, index) => (
          <div
            key={index}
            className="flex justify-between py-2 cursor-pointer hover:bg-gray-100 px-3"
            onClick={() => addTasksOnInvoice(invoice)}
          >
            <span>{invoice.number}</span>

            <span>
              {formatMoney(
                invoice.amount,
                invoice.client?.country_id || '',
                invoice.client?.settings.currency_id
              )}
            </span>
          </div>
        ))}

        {!invoices && <Spinner />}
      </div>
    </Modal>
  );
}
