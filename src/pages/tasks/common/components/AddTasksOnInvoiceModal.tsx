/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Task } from '$app/common/interfaces/task';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useAddTasksOnInvoice } from '../hooks/useAddTasksOnInvoice';
import { Invoice } from '$app/common/interfaces/invoice';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  tasks: Task[];
  invoices: Invoice[];
}

export function AddTasksOnInvoiceModal(props: Props) {
  const { visible, setVisible, tasks, invoices } = props;

  const formatMoney = useFormatMoney();

  const addTasksOnInvoice = useAddTasksOnInvoice({ tasks });

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
                invoice.client?.country_id,
                invoice.client?.settings.currency_id
              )}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
