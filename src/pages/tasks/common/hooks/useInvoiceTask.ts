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
import { useSetAtom } from 'jotai';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { route } from '$app/common/helpers/route';
import { useTranslation } from 'react-i18next';
import { toast } from '$app/common/helpers/toast/toast';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useUserNumberPrecision } from '$app/common/hooks/useUserNumberPrecision';
import { useNumericFormatter } from '$app/common/hooks/useNumericFormatter';
import { useGetCurrencySeparators } from '$app/common/hooks/useGetCurrencySeparators';
import { useResolveDateAndTimeClientFormat } from '$app/pages/clients/common/hooks/useResolveDateAndTimeClientFormat';

interface Params {
  onlyAddToInvoice?: boolean;
}

export function useInvoiceTask(params?: Params) {
  const [t] = useTranslation();

  const { onlyAddToInvoice } = params || {};

  const navigate = useNavigate();
  const numericFormatter = useNumericFormatter();
  const getCurrencySeparators = useGetCurrencySeparators();

  const company = useCurrentCompany();
  const { data } = useBlankInvoiceQuery();
  const { timeFormat } = useCompanyTimeFormat();
  const userNumberPrecision = useUserNumberPrecision();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const setInvoice = useSetAtom(invoiceAtom);

  const resolveDateAndTimeClientFormat = useResolveDateAndTimeClientFormat();

  const calculateTaskHours = (timeLog: string, precision?: number) => {
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
          hoursSum = Number(hoursSum.toFixed(precision || userNumberPrecision));
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

      invoice.uses_inclusive_taxes =
        company?.settings?.inclusive_taxes ?? false;

      const clients = collect(tasks).pluck('client_id').unique().toArray();

      if (clients.length > 1) {
        return toast.error('multiple_client_error');
      }

      invoice.client_id = tasks[0].client_id;

      if (tasks[0]?.project_id) {
        invoice.project_id = tasks[0]?.project_id;
      }

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
              description.push('<div class="task-time-details">');
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
              description.push(`\n${intervalDescription}`);
            }

            if (company.invoice_task_datelog || company.invoice_task_timelog) {
              description.push('\n');

              description.push('</div>');
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

        if (typeof invoice.line_items === 'string') {
          invoice.line_items = [];
        }

        invoice.line_items.push(item);
      });

      if (!onlyAddToInvoice) {
        setInvoice(invoice);

        navigate(
          route(
            '/invoices/create?table=tasks&project=:projectAssigned&action=invoice_task',
            {
              projectAssigned: Boolean(tasks[0].project_id),
            }
          )
        );
      } else {
        setInvoice(
          (current) =>
            current && {
              ...current,
              line_items: [...current.line_items, ...invoice.line_items],
            }
        );
      }
    }
  };
}
