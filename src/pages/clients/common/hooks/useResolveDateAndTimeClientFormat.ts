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
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';

export function useResolveDateAndTimeClientFormat<T = any>(resource?: T) {
  const company = useCurrentCompany();
  const clientResolver = useClientResolver();
  const { timeFormat } = useCompanyTimeFormat();

  const resolveDateFormat = useResolveDateFormat();

  return async (relationId: string, client?: Client) => {
    const dateFormat = resolveDateFormat(company?.settings.date_format_id);

    const dateTimeFormats = {
      dateFormat,
      timeFormat: timeFormat,
    };

    if (relationId.length >= 1) {
      // Check if client is already available in the resource relation or passed directly
      const clientData = client || 
        (resource && typeof resource === 'object' && resource !== null && 'client' in resource && resource.client as Client | undefined);

      if (clientData) {
        if (clientData.settings.date_format_id) {
          dateTimeFormats.dateFormat = resolveDateFormat(
            clientData.settings.date_format_id
          );
        }
        dateTimeFormats.timeFormat = timeFormat;
      } else {
        // Only fetch if client not already available
        await clientResolver.find(relationId)
          .then((fetchedClient: Client) => {
            if (fetchedClient.settings.date_format_id) {
              dateTimeFormats.dateFormat = resolveDateFormat(
                fetchedClient.settings.date_format_id
              );
            }
            dateTimeFormats.timeFormat = timeFormat;
          })
          .catch(() => {
            // Silently fail if user doesn't have permission - use company defaults
          });
      }
    }

    return dateTimeFormats;
  };
}
