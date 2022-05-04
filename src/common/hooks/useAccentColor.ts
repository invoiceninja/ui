/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import colors from 'common/constants/colors';
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';
import { useCurrentUser } from './useCurrentUser';

export function useAccentColor() {
  const user = useCurrentUser();
  const userState = useSelector((state: RootState) => state.user);

  return (
    userState.changes?.company_user?.settings?.accent_color ||
    user?.company_user?.settings?.accent_color ||
    colors.accent
  );
}
