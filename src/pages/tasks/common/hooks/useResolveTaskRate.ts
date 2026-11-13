/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { useGroupSettingsQuery } from '$app/common/queries/group-settings';

export function useResolveTaskRate() {
  const company = useCurrentCompany();

  const { data: groupSettings } = useGroupSettingsQuery({ perPage: 1000 });

  return (client: Client) => {
    const group =
      client.group_settings ??
      groupSettings?.find(({ id }) => id === client.group_settings_id);

    const rate = [
      client.settings?.default_task_rate,
      group?.settings?.default_task_rate,
      company?.settings?.default_task_rate,
    ].find((value) => Number(value) > 0);

    return Number(rate ?? 0);
  };
}
