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

export function useGroupSettingsQuery() {
  return useQuery('/api/v1/group_settings', () => {
    return axios.get(endpoint('/api/v1/group_settings'), {
      headers: defaultHeaders,
    });
  });
}
