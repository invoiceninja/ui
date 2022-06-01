/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from 'common/queries/statics';
import { useEffect, useState } from 'react';
import { useCurrentCompany } from './useCurrentCompany';

export function useCurrentCompanyDateFormats() {
  const company = useCurrentCompany();

  const { data: statics } = useStaticsQuery();

  const [dateFormatId, setDateFormatId] = useState('0');
  const [dateFormat, setDateFormat] = useState('DD/MMM/YYYY');

  useEffect(() => {
    if (statics?.data?.date_formats) {
      const result = statics.data.date_formats.find(
        (format: any) => format.id === company?.settings?.date_format_id ?? '0'
      );

      if (result) {
        setDateFormat(result.format_moment);
        setDateFormatId(result.id);
      }
    }
  }, [company, statics]);

  return {
    dateFormatId,
    dateFormat,
  };
}
