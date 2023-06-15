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
import { parseTimeLog } from '../helpers/calculate-time';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import dayjs from 'dayjs';
import { Invoice } from '$app/common/interfaces/invoice';
import {
  InvoiceItem,
  InvoiceItemType,
} from '$app/common/interfaces/invoice-item';
import collect from 'collect.js';
import { useAtom } from 'jotai';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { route } from '$app/common/helpers/route';
import { useTranslation } from 'react-i18next';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';

export function useInvoiceTask() {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const company = useCurrentCompany();

  const { dateFormat } = useCurrentCompanyDateFormats();
  const { timeFormat } = useCompanyTimeFormat();
  const { data } = useBlankInvoiceQuery();


  const [, setInvoice] = useAtom(invoiceAtom);

  const calculateTaskHours = (timeLog: string) => {
    const parsedTimeLogs = parseTimeLog(timeLog);

    let hoursSum = 0;

    if (parsedTimeLogs.length) {
      parsedTimeLogs.forEach(([start, stop, , billable]) => {
        if (
          billable ||
          !company?.settings.allow_billable_task_items ||
          typeof billable === 'undefined'
        ) {
          const unixStart = dayjs.unix(start);
          const unixStop = dayjs.unix(stop);

          hoursSum += unixStop.diff(unixStart, 'seconds') / 3600;
          hoursSum = Number(hoursSum.toFixed(4));
        }
      });
    }

    return hoursSum;
  };

  return async (tasks: Task[]) => {
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

      invoice.client_id = tasks[0].client_id;

      tasks.forEach(async (task) => {
        const logs = parseTimeLog(task.time_log);
        const parsed: string[] = [];

        logs.forEach(([start, stop, , billable]) => {
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

            const start_date_log = `${dayjs.unix(start).format(`${dateFormat}`)}`;
            const start_time_log = `${dayjs.unix(start).format(`${timeFormat}`)}`;
            const end_time_log = `${dayjs.unix(stop).format(`${timeFormat}`)}`;

            const description = [];

            if(company.invoice_task_datelog || company.invoice_task_timelog)
              description.push('<div class="task-time-details">');

            if (company.invoice_task_datelog)
              description.push(start_date_log);

            if (company.invoice_task_timelog)
              description.push(start_time_log + ' - ');

            if (company.invoice_task_timelog)
              description.push(end_time_log);

            if (company.invoice_task_hours)
              description.push(hoursDescription);

            if (company.invoice_task_datelog || company.invoice_task_timelog)
              description.push('</div>\n');
              
            console.log(description);

            parsed.push(
              description.join(' '),
            );
          }
        });

        const taskQuantity = calculateTaskHours(task.time_log);

        const item: InvoiceItem = {
          ...blankLineItem(),
          type_id: InvoiceItemType.Task,
          cost: task.rate,
          quantity: taskQuantity,
          line_total: Number((task.rate * taskQuantity).toFixed(2)),
        };
        
        const project_name = (company.invoice_task_project && task?.project?.name) ? '## ' + task.project?.name + '\n' : '';
        const task_description = company.invoice_task_item_description ? '### ' + task?.description + '\n' : '';

        if (parsed.length) {

          item.notes = 
            project_name + task_description + ' ' + parsed.join(' ');
        }

        invoice.line_items = parsed.length ? [item] : [];

        setInvoice(invoice);

        navigate(
          route(
            '/invoices/create?table=tasks&project=:projectAssigned&action=invoice_task',
            {
              projectAssigned: Boolean(tasks[0].project_id),
            }
          )
        );
      });
    }
  };
}
