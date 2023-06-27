/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Task } from '$app/common/interfaces/task';
import { useBlankInvoiceQuery } from '$app/common/queries/invoices';
import { useNavigate } from 'react-router-dom';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import dayjs from 'dayjs';
import { Invoice } from '$app/common/interfaces/invoice';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import collect from 'collect.js';
import toast from 'react-hot-toast';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { route } from '$app/common/helpers/route';
import { parseTimeLog } from '$app/pages/tasks/common/helpers/calculate-time';
import { useSetAtom } from 'jotai';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

export const calculateTaskHours = (timeLog: string) => {
  const parsedTimeLogs = parseTimeLog(timeLog);

  let hoursSum = 0;

  if (parsedTimeLogs.length) {
    parsedTimeLogs.forEach(([start, stop]) => {
      const unixStart = dayjs.unix(start);
      const unixStop = dayjs.unix(stop);

      hoursSum += Number(
        (unixStop.diff(unixStart, 'seconds') / 3600).toFixed(4)
      );
    });
  }

  return hoursSum;
};

export function useInvoiceProject() {
  const navigate = useNavigate();
  const company = useCurrentCompany();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { timeFormat } = useCompanyTimeFormat();
  const { data } = useBlankInvoiceQuery();

  const setInvoice = useSetAtom(invoiceAtom);

  return (tasks: Task[]) => {
    if (data) {
      const invoice: Invoice = { ...data };

      if (company && company.enabled_tax_rates > 0) {
        invoice.tax_name1 = company.settings?.tax_name1;
        invoice.tax_rate1 = company.settings?.tax_rate1;
      }

      if (company && company.enabled_tax_rates > 1) {
        invoice.tax_name2 = company.settings?.tax_name2;
        invoice.tax_rate2 = company.settings?.tax_rate2;
      }

      if (company && company.enabled_tax_rates > 2) {
        invoice.tax_name3 = company.settings?.tax_name3;
        invoice.tax_rate3 = company.settings?.tax_rate3;
      }

      const clients = collect(tasks).pluck('client_id').unique().toArray();

      if (clients.length > 1) {
        return toast.error('multiple_client_error');
      }

      invoice.client_id = tasks.length ? tasks[0].client_id : '';

      invoice.line_items = [];

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
      });

      setInvoice(invoice);

      navigate(
        route(
          '/invoices/create?table=tasks&project=true&action=invoice_project'
        )
      );
    }
  };
}
