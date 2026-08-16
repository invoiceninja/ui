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
import { GroupSettings } from '../interfaces/group-settings';
import { useGroupSettingsQuery } from '../queries/group-settings';
import { useCurrentCompany } from './useCurrentCompany';

interface Props {
  withoutCompanySettingsFallback?: boolean;
}

function resolveSetting(
  client: Client | undefined,
  propertyKey: keyof Settings,
  groupSettings: GroupSettings[] | undefined,
  company: { settings: Settings },
  withoutCompanySettingsFallback: boolean
) {
  if (!groupSettings || !client) {
    return { value: undefined, level: null };
  }

  if (client.settings[propertyKey] !== undefined) {
    return { value: client.settings[propertyKey], level: 'Client' };
  }

  if (
    client.group_settings &&
    client.group_settings.settings[propertyKey] !== undefined
  ) {
    return {
      value: client.group_settings.settings[propertyKey],
      level: 'Group',
    };
  }

  if (client.group_settings_id && !client.group_settings) {
    const currentGroupSettings = groupSettings.find(
      ({ id }) => id === client.group_settings_id
    );

    if (
      currentGroupSettings &&
      currentGroupSettings.settings[propertyKey] !== undefined
    ) {
      return {
        value: currentGroupSettings.settings[propertyKey],
        level: 'Group',
      };
    }
  }

  if (withoutCompanySettingsFallback) {
    return { value: undefined, level: null };
  }

  return { value: company.settings[propertyKey], level: 'Company' };
}

export function useGetSetting({
  withoutCompanySettingsFallback = false,
}: Props = {}) {
  const company = useCurrentCompany();

  const { data: groupSettings } = useGroupSettingsQuery({ perPage: 1000 });

  return (client: Client | undefined, propertyKey: keyof Settings) => {
    return resolveSetting(
      client,
      propertyKey,
      groupSettings,
      company,
      withoutCompanySettingsFallback
    ).value;
  };
}

export function useGetSettingWithLevel() {
  const company = useCurrentCompany();

  const { data: groupSettings } = useGroupSettingsQuery({ perPage: 1000 });

  return (client: Client | undefined, propertyKey: keyof Settings) => {
    return resolveSetting(client, propertyKey, groupSettings, company, false);
  };
}
