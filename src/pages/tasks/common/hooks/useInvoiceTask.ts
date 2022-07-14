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
import { useSetCurrentInvoiceProperty } from 'pages/invoices/common/hooks/useSetCurrentInvoiceProperty';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { blankLineItem } from 'common/stores/slices/invoices/constants/blank-line-item';
import { parseTimeLog } from '../helpers/calculate-time';
import { useCurrentCompanyDateFormats } from 'common/hooks/useCurrentCompanyDateFormats';
import dayjs from 'dayjs';

export function useInvoiceTask() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const company = useCurrentCompany();
  const handleChange = useSetCurrentInvoiceProperty();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { data: invoice } = useBlankInvoiceQuery();

  return (task: Task) => {
    if (invoice?.data.data) {
      dispatch(setCurrentInvoice(invoice.data.data));

      if (company && company.enabled_tax_rates > 0) {
        handleChange('tax_name1', company.settings?.tax_name1);
        handleChange('tax_rate1', company.settings?.tax_rate1);
      }

      if (company && company.enabled_tax_rates > 1) {
        handleChange('tax_name2', company.settings?.tax_name2);
        handleChange('tax_rate2', company.settings?.tax_rate2);
      }

      if (company && company.enabled_tax_rates > 2) {
        handleChange('tax_name3', company.settings?.tax_name3);
        handleChange('tax_rate3', company.settings?.tax_rate3);
      }

      const logs = parseTimeLog(task.time_log);
      const parsed: string[] = [];

      logs.forEach(([start, stop]) => {
        parsed.push(
          `${dayjs.unix(start).format(`${dateFormat} hh:mm:ss A`)} - ${dayjs
            .unix(stop)
            .format('hh:mm:ss A')} <br />`
        );
      });

      const item = { ...blankLineItem };

      item.type_id = '2';

      item.notes = [
        task.description,
        '<div class="task-time-details">',
        ...parsed,
        '</div>',
      ].join('\n');

      handleChange('line_items', [item]);

      navigate('/invoices/create?preload=true&table=tasks');
    }
  };
}
