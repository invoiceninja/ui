/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import { defaultHeaders } from './common/headers';

export function useDashboardChartsQuery() {
  return useQuery('/api/v1/charts/totals', () => {
    return axios.post(
      endpoint(
        '/api/v1/charts/totals?start_date=1970-01-01&end_date=2022-12-31'
      ),
      {
        headers: {
          ...defaultHeaders,
          'Content-Type': 'application/json',
        },
        data: { start_date: '1970-01-01', end_date: '2022-12-31' },
      }
    );
  });
}
