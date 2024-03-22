/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '../interfaces/client';
import { Settings } from '../interfaces/company.interface';
import { useGroupSettingsQuery } from '../queries/group-settings';
import { useCurrentCompany } from './useCurrentCompany';

export function useGetSetting() {
  const company = useCurrentCompany();

  const { data: groupSettings } = useGroupSettingsQuery({ perPage: 1000 });

  return (client: Client | undefined, propertyKey: keyof Settings) => {
    if (groupSettings && client) {
      if (client.settings[propertyKey] !== undefined) {
        return client.settings[propertyKey];
      }

      if (
        client.group_settings &&
        client.group_settings.settings[propertyKey] !== undefined
      ) {
        return client.group_settings.settings[propertyKey];
      }

      if (client.group_settings_id && !client.group_settings) {
        const currentGroupSettings = groupSettings.find(
          ({ id }) => id === client.group_settings_id
        );

        if (
          currentGroupSettings &&
          currentGroupSettings.settings[propertyKey] !== undefined
        ) {
          return currentGroupSettings.settings[propertyKey];
        }
      }

      return company.settings[propertyKey];
    }

    return undefined;
  };
}
