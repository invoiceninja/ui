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

export function useReactSettings() {
  const reactSettings =
    useSelector(
      (state: RootState) => state.user.changes?.company_user?.react_settings
    ) || {};

  const settings: ReactSettings = {
    show_pdf_preview: true,
    ...reactSettings,
  };

  return settings;
}
