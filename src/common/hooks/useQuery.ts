/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { useQuery as useQueryHook } from 'react-query';

export function useQuery(apiEndpoint: string, options = {}) {
  return useQueryHook(
    apiEndpoint,
    () => axios.get(endpoint(apiEndpoint), { headers: defaultHeaders() }),
    options
  );
}
