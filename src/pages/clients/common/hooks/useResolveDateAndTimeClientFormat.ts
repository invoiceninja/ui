/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveDateFormat } from '$app/common/helpers/dates/date-format-resolver';
import { useResolveTimezone } from '$app/common/helpers/timezone/timezone-resolver';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';

export function useResolveDateAndTimeClientFormat() {
  const company = useCurrentCompany();
  const clientResolver = useClientResolver();

  const resolveTimezone = useResolveTimezone();
  const resolveDateFormat = useResolveDateFormat();

  const getTimeFormat = (militaryTime: boolean) => {
    return militaryTime ? 'HH:mm:ss' : 'hh:mm:ss A';
  };

  return async (relationId: string) => {
    const timeZone = resolveTimezone(company?.settings.timezone_id);
    const dateFormat = resolveDateFormat(company?.settings.date_format_id);

    const dateTimeFormats = {
      dateFormat,
      timeZone,
      timeFormat: getTimeFormat(Boolean(company?.settings.military_time)),
    };

    if (relationId.length >= 1) {
      await clientResolver.find(relationId).then((client: Client) => {
        if (client.settings.date_format_id) {
          dateTimeFormats.dateFormat = resolveDateFormat(
            client.settings.date_format_id
          );
        }

        if (client.settings.timezone_id) {
          dateTimeFormats.timeZone = resolveTimezone(
            client.settings.timezone_id
          );
        }

        dateTimeFormats.timeFormat = getTimeFormat(
          Boolean(client.settings.military_time)
        );
      });
    }

    return dateTimeFormats;
  };
}
