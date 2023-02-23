/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactSettings } from 'common/interfaces/company-user';
import { RootState } from 'common/stores/store';
import { useSelector } from 'react-redux';

export function useReactSettings() {
  let reactSettings = useSelector(
    (state: RootState) => state.user.changes?.company_user?.react_settings
  ) as ReactSettings | undefined;

  if (reactSettings && typeof reactSettings.show_pdf_preview === 'undefined') {
    reactSettings = { ...reactSettings, show_pdf_preview: true };
  }

  return reactSettings;
}
