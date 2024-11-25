/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '../queries/statics';

export function useGetTimezone() {
  const { data: statics } = useStaticsQuery();

  return (timeZoneId: string | undefined) => {
    if (statics?.timezones && timeZoneId) {
      const result = statics.timezones.find(
        (format: any) => format.id === timeZoneId
      );

      if (result) {
        return {
          timeZoneId: result.id,
          timeZone: result.name,
        };
      }
    }

    return {
      timeZoneId: '1',
      timeZone: 'America/Tijuana',
    };
  };
}
