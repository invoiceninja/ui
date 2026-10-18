/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';

export function useTaskMetricFieldsSupport() {
  const { data } = useQuery({
    queryKey: ['/api/v1/charts/calculated_fields', 'task_metrics'],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/calculated_fields'),
        {
          date_range: 'this_month',
          start_date: dayjs().startOf('month').format('YYYY-MM-DD'),
          end_date: dayjs().endOf('month').format('YYYY-MM-DD'),
          field: 'task_estimated_duration',
          calculation: 'sum',
          period: 'current',
          format: 'time',
          currency_id: '1',
        },
        { skipIntercept: true }
      )
        .then(() => true)
        .catch((error: AxiosError) => error.response?.status !== 422),
    staleTime: Infinity,
    retry: false,
  });

  return data !== false;
}
