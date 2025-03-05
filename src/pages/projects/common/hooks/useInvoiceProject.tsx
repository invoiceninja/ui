/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { parseTimeLog } from '$app/pages/tasks/common/helpers/calculate-time';
import { useSetAtom } from 'jotai';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useBulkAction } from '$app/pages/projects/common/hooks/useBulkAction';

export const calculateTaskHours = (timeLog: string, precision?: number) => {
  const parsedTimeLogs = parseTimeLog(timeLog);

  let hoursSum = 0;

  if (parsedTimeLogs.length) {
    parsedTimeLogs.forEach(([start, stop]) => {
      if (start && stop) {
        const unixStart = dayjs.unix(start);
        const unixStop = dayjs.unix(stop);

        hoursSum += Number(
          (unixStop.diff(unixStart, 'seconds') / 3600).toFixed(precision)
        );
      }
    });
  }

  return hoursSum;
};

export function useInvoiceProject() {
  const navigate = useNavigate();

  const bulk = useBulkAction();

  const setInvoice = useSetAtom(invoiceAtom);

  return (projectIds: string[]) => {
    toast.processing();

    bulk(projectIds, 'invoice').then(
      (response: GenericSingleResourceResponse<Invoice>) => {
        setInvoice(response.data.data);

        navigate(
          route(
            '/invoices/create?table=tasks&project=true&action=invoice_project'
          )
        );
      }
    );
  };
}
