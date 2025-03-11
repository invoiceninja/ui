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
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNumericFormatter } from '$app/common/hooks/useNumericFormatter';
import { useUserNumberPrecision } from '$app/common/hooks/useUserNumberPrecision';
import { useGetCurrencySeparators } from '$app/common/hooks/useGetCurrencySeparators';
import { useResolveDateAndTimeClientFormat } from '$app/pages/clients/common/hooks/useResolveDateAndTimeClientFormat';

interface Params {
  tasks: Task[];
}

export function useAddTasksOnInvoice(params: Params) {
  const [t] = useTranslation();

  const { tasks } = params;

  const navigate = useNavigate();
  const numericFormatter = useNumericFormatter();
  const getCurrencySeparators = useGetCurrencySeparators();
  const resolveDateAndTimeClientFormat = useResolveDateAndTimeClientFormat();

  const company = useCurrentCompany();
  const { timeFormat } = useCompanyTimeFormat();
  const userNumberPrecision = useUserNumberPrecision();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const setInvoiceAtom = useSetAtom(invoiceAtom);

  return async (invoice: Invoice) => {
    const updatedInvoice = cloneDeep(invoice);

    if (tasks) {
      const currencySeparators = await getCurrencySeparators(
        tasks[0]?.client_id,
        'client_id'
      );

      const { dateFormat: clientDateFormat, timeFormat: clientTimeFormat } =
        await resolveDateAndTimeClientFormat(tasks[0]?.client_id);

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

              const hours = numericFormatter(
                (unixStop.diff(unixStart, 'seconds') / 3600).toString(),
                currencySeparators?.thousandSeparator,
                currencySeparators?.decimalSeparator,
                currencySeparators?.precision
              );

              hoursDescription = `• ${hours} ${t('hours')}`;
            }

            const description = [];

            if (company.invoice_task_datelog || company.invoice_task_timelog) {
              description.push('<div class="task-time-details">\n');
            }

            if (company.invoice_task_datelog) {
              description.push(
                dayjs
                  .unix(start)
                  .format(
                    clientDateFormat?.format_moment
                      ? clientDateFormat.format_moment
                      : dateFormat
                  )
              );
            }

            if (company.invoice_task_timelog) {
              description.push(
                dayjs
                  .unix(start)
                  .format(clientTimeFormat ? clientTimeFormat : timeFormat) +
                  ' - '
              );
            }

            if (company.invoice_task_timelog) {
              description.push(
                dayjs
                  .unix(stop)
                  .format(clientTimeFormat ? clientTimeFormat : timeFormat)
              );
            }

            if (company.invoice_task_hours) {
              description.push(hoursDescription);
            }

            if (company.invoice_task_item_description && intervalDescription) {
              description.push(`\n\n${intervalDescription}`);
            }

            if (company.invoice_task_datelog || company.invoice_task_timelog) {
              description.push('\n');

              description.push('</div>\n');
            }

            parsed.push(description.join(' '));
          }
        });

        const taskQuantity = calculateTaskHours(
          task.time_log,
          userNumberPrecision
        );

        const item: InvoiceItem = {
          ...blankLineItem(),
          type_id: InvoiceItemType.Task,
          cost: task.rate,
          quantity: taskQuantity,
          line_total: Number(
            (task.rate * taskQuantity).toFixed(userNumberPrecision)
          ),
          task_id: task.id,
          tax_id: '',
          custom_value1: task.custom_value1,
          custom_value2: task.custom_value2,
          custom_value3: task.custom_value3,
          custom_value4: task.custom_value4,
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
