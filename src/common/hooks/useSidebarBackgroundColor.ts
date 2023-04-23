/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import colors from '$app/common/constants/colors';
import { RootState } from '$app/common/stores/store';
import { useSelector } from 'react-redux';
import { useCurrentUser } from './useCurrentUser';

export function useSidebarBackgroundColor() {
  const user = useCurrentUser();
  const userState = useSelector((state: RootState) => state.user);

  return (
    userState.changes?.company_user?.react_settings?.sidebar_background ||
    user?.company_user?.react_settings?.sidebar_background ||
    colors.ninjaGray
  );
}
