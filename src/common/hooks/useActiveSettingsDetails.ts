/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSelector } from 'react-redux';
import { RootState } from '../stores/store';

export function useActiveSettingsDetails() {
  const activeSettings = useSelector(
    (state: RootState) => state.settings.activeSettings
  );

  return {
    name: activeSettings.name,
    level: activeSettings.level,
  };
}
