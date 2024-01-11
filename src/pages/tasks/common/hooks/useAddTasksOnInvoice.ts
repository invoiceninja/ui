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
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { t } from 'i18next';
import { cloneDeep } from 'lodash';

interface Params {
  tasks: Task[];
}

export function useAddTasksOnInvoice(params: Params) {
  const navigate = useNavigate();

  const { tasks } = params;
  const company = useCurrentCompany();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { timeFormat } = useCompanyTimeFormat();

  const setInvoiceAtom = useSetAtom(invoiceAtom);

  return (invoice: Invoice) => {
    const updatedInvoice = cloneDeep(invoice);

    if (tasks) {
      tasks.forEach((task: Task) => {
        const logs = parseTimeLog(task.time_log);
        const parsed: string[] = [];

        logs.forEach(([start, stop, intervalDescription, billable]) => {
          if (
            billable ||
            !company?.settings.allow_billable_task_items ||
            typeof billable === 'undefined'
          ) {
            let hoursDescription = '';

            if (company.invoice_task_hours) {
              const unixStart = dayjs.unix(start);
              const unixStop = dayjs.unix(stop);

              const hours = (
                unixStop.diff(unixStart, 'seconds') / 3600
              ).toFixed(4);

              hoursDescription = `• ${hours} ${t('hours')}`;
            }

            const description = [];

            if (company.invoice_task_datelog || company.invoice_task_timelog) {
              description.push('<div class="task-time-details">');
            }

            if (company.invoice_task_datelog) {
              description.push(dayjs.unix(start).format(dateFormat));
            }

            if (company.invoice_task_timelog) {
              description.push(dayjs.unix(start).format(timeFormat) + ' - ');
            }

            if (company.invoice_task_timelog) {
              description.push(dayjs.unix(stop).format(timeFormat));
            }

            if (company.invoice_task_hours) {
              description.push(hoursDescription);
            }

            if (company.invoice_task_item_description) {
              description.push(intervalDescription);
            }

            if (company.invoice_task_datelog || company.invoice_task_timelog) {
              description.push('</div>\n');
            }

            parsed.push(description.join(' '));
          }
        });

        const taskQuantity = calculateTaskHours(task.time_log);

        const item: InvoiceItem = {
          ...blankLineItem(),
          type_id: InvoiceItemType.Task,
          cost: task.rate,
          quantity: taskQuantity,
          line_total: Number((task.rate * taskQuantity).toFixed(2)),
          task_id: task.id,
          tax_id: '',
        };

        const projectName =
          company.invoice_task_project && task?.project?.name
            ? '## ' + task.project?.name + '\n'
            : '';

        if (parsed.length) {
          item.notes = projectName + task?.description + ' ' + parsed.join(' ');
        }

        if (typeof updatedInvoice.line_items === 'string') {
          updatedInvoice.line_items = [];
        }

        updatedInvoice.line_items.push(item);
      });

      setInvoiceAtom(updatedInvoice);

      navigate(
        route('/invoices/:id/edit?action=add_tasks&table=tasks', {
          id: updatedInvoice.id,
        })
      );
    }
  };
}
