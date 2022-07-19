/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Task } from 'common/interfaces/task';
import { useBlankInvoiceQuery } from 'common/queries/invoices';
import { setCurrentInvoice } from 'common/stores/slices/invoices/extra-reducers/set-current-invoice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { blankLineItem } from 'common/stores/slices/invoices/constants/blank-line-item';
import { parseTimeLog } from '../helpers/calculate-time';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import dayjs from 'dayjs';
import { Invoice } from 'common/interfaces/invoice';
import { InvoiceItem, InvoiceItemType } from 'common/interfaces/invoice-item';

export function useInvoiceTask() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const company = useCurrentCompany();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: invoiceQuery } = useBlankInvoiceQuery();

  return (tasks: Task[]) => {
    if (invoiceQuery?.data.data) {
      const invoice: Invoice = { ...invoiceQuery.data.data };

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

      tasks.forEach((task) => {
        const logs = parseTimeLog(task.time_log);
        const parsed: string[] = [];

        logs.forEach(([start, stop]) => {
          parsed.push(
            `${dayjs.unix(start).format(`${dateFormat} hh:mm:ss A`)} - ${dayjs
              .unix(stop)
              .format('hh:mm:ss A')} <br />`
          );
        });

        const item: InvoiceItem = {
          ...blankLineItem(),
          type_id: InvoiceItemType.Task,
        };

        item.notes = [
          task.description,
          '<div class="task-time-details">',
          ...parsed,
          '</div>',
        ]
          .join('\n')
          .trim();

        invoice.line_items = [item];
      });

      dispatch(setCurrentInvoice(invoice));

      navigate('/invoices/create?preload=true&table=tasks');
    }
  };
}
