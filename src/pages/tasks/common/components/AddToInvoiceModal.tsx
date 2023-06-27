/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankLineItem } from '$app/common/constants/blank-line-item';
import { trans } from '$app/common/helpers';
import { route } from '$app/common/helpers/route';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Invoice } from '$app/common/interfaces/invoice';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { Task } from '$app/common/interfaces/task';
import { Modal } from '$app/components/Modal';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { calculateTaskHours } from '$app/pages/projects/common/hooks/useInvoiceProject';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseTimeLog } from '../helpers/calculate-time';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  invoices: Invoice[];
}

export const taskToAddAtom = atom<Task | null>(null);

export function AddToInvoiceModal(props: Props) {
  const navigate = useNavigate();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { timeFormat } = useCompanyTimeFormat();

  const formatMoney = useFormatMoney();

  const taskToAdd = useAtomValue(taskToAddAtom);

  const setInvoiceAtom = useSetAtom(invoiceAtom);

  const { visible, setVisible, invoices } = props;

  const handleNavigateToInvoice = (invoice: Invoice) => {
    if (taskToAdd) {
      const updatedInvoice = {
        ...invoice,
      };

      const logs = parseTimeLog(taskToAdd.time_log);
      const parsed: string[] = [];

      logs.forEach(([start, stop]) => {
        parsed.push(
          `${dayjs.unix(start).format(`${dateFormat} ${timeFormat}`)} - ${dayjs
            .unix(stop)
            .format(timeFormat)} <br />`
        );
      });

      const taskQuantity = calculateTaskHours(taskToAdd.time_log);

      const item: InvoiceItem = {
        ...blankLineItem(),
        type_id: InvoiceItemType.Task,
        cost: taskToAdd.rate,
        quantity: taskQuantity,
        line_total: Number((taskToAdd.rate * taskQuantity).toFixed(2)),
      };

      item.notes = [
        taskToAdd.description,
        '<div class="task-time-details">',
        ...parsed,
        '</div>',
      ]
        .join('\n')
        .trim();

      updatedInvoice.line_items.push(item);

      setInvoiceAtom(updatedInvoice);

      navigate(
        route('/invoices/:id/edit?action=add_task&table=tasks', {
          id: invoice.id,
        })
      );
    }
  };

  return (
    <Modal
      title={trans('add_to_invoice', { invoice: '' })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <div className="flex flex-col overflow-y-auto max-h-96">
        {invoices.map((invoice, index) => (
          <div
            key={index}
            className="flex justify-between py-2 cursor-pointer hover:bg-gray-100 px-3"
            onClick={() => handleNavigateToInvoice(invoice)}
          >
            <span>{invoice.number}</span>

            <span>
              {formatMoney(
                invoice.balance,
                invoice.client?.country_id || '',
                invoice.client?.settings.currency_id
              )}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
