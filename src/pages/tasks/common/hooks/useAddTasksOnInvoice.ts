/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { Invoice } from '$app/common/interfaces/invoice';
import { parseTimeLog } from '../helpers/calculate-time';
import dayjs from 'dayjs';
import { calculateTaskHours } from '$app/pages/projects/common/hooks/useInvoiceProject';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import { route } from '$app/common/helpers/route';
import { Task } from '$app/common/interfaces/task';

interface Params {
  tasks: Task[];
}

export function useAddTasksOnInvoice(params: Params) {
  const navigate = useNavigate();

  const { tasks } = params;

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { timeFormat } = useCompanyTimeFormat();

  const setInvoiceAtom = useSetAtom(invoiceAtom);

  return (invoice: Invoice) => {
    if (tasks) {
      tasks.forEach((task) => {
        const logs = parseTimeLog(task.time_log);
        const parsed: string[] = [];

        logs.forEach(([start, stop]) => {
          parsed.push(
            `${dayjs
              .unix(start)
              .format(`${dateFormat} ${timeFormat}`)} - ${dayjs
              .unix(stop)
              .format(timeFormat)} <br />`
          );
        });

        const taskQuantity = calculateTaskHours(task.time_log);

        const item: InvoiceItem = {
          ...blankLineItem(),
          type_id: InvoiceItemType.Task,
          cost: task.rate,
          quantity: taskQuantity,
          line_total: Number((task.rate * taskQuantity).toFixed(2)),
        };

        item.notes = [
          task.description,
          '<div class="task-time-details">',
          ...parsed,
          '</div>',
        ]
          .join('\n')
          .trim();

        invoice.line_items.push(item);

        setInvoiceAtom(invoice);

        navigate(
          route('/invoices/:id/edit?action=add_tasks&table=tasks', {
            id: invoice.id,
          })
        );
      });
    }
  };
}
