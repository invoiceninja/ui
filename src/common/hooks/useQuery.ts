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
import { request } from 'common/helpers/request';
import { defaultHeaders } from 'common/queries/common/headers';
import { useQuery as useQueryHook } from 'react-query';

export function useQuery(apiEndpoint: string, options = {}) {
  return useQueryHook(
    apiEndpoint,
    () => request('GET', endpoint(apiEndpoint)),
    options
  );
}
