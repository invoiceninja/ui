/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '$app/common/queries/statics';
import { useEffect, useState } from 'react';
import { useCurrentCompany } from './useCurrentCompany';
import { Timezone } from '../interfaces/timezone';

export function useCompanyTimeZone() {
  const company = useCurrentCompany();

  const { data: statics } = useStaticsQuery();

  const [timeZoneId, setTimeZoneId] = useState('1');
  const [timeZone, setTimeZone] = useState<Timezone>();

  useEffect(() => {
    if (statics?.timezones) {
      const result = statics.timezones.find(
        (format: any) => format.id === company?.settings?.timezone_id ?? '1'
      );

      if (result) {
        setTimeZone(result);
        setTimeZoneId(result.id);
      }
    }
  }, [company, statics]);

  return {
    timeZoneId,
    timeZone: timeZone?.name,
    timeZoneOffset: timeZone?.utc_offset,
  };
}
