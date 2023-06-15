/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactSettings } from '$app/common/interfaces/company-user';
import { RootState } from '$app/common/stores/store';
import { useSelector } from 'react-redux';
import { useCurrentUser } from './useCurrentUser';

export function useReactSettings() {
  const currentUser = useCurrentUser();

  const reactSettings =
    useSelector(
      (state: RootState) => state.user.changes?.company_user?.react_settings
    ) || {};

  const previousReactTableColumns =
    currentUser?.company_user?.settings?.react_table_columns;

  const settings: ReactSettings = {
    show_pdf_preview: true,
    react_notification_link: true,
    ...reactSettings,
    // This is legacy fallback for old settings location. If you see this in 2 years, feel free to remove it.
    react_table_columns: {
      ...previousReactTableColumns,
      ...reactSettings.react_table_columns,
    },
  };

  return settings;
}
