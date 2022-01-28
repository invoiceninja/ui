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
  return useQuery('/api/v1/charts/chart_summary', () => {
    return axios.get(
      endpoint(
        '/api/v1/charts/chart_summary?start_date=2020-01-01&end_date=2020-04-06'
      ),
      {
        headers: defaultHeaders,
      }
    );
  });
}
