/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { User } from 'common/interfaces/user';
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';

export function useCurrentUser() {
  return useSelector((state: RootState) => state.user.user) as User | undefined;
}
