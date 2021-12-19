/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
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
    setDateFormatId(company?.settings?.date_format_id);

    if (statics?.data?.date_formats) {
      let result = statics.data.date_formats.filter(
        (format: any) => format.id === dateFormatId
      );

      setDateFormat(result?.[0]?.format_moment);
    }
  }, [company, statics]);

  return {
    dateFormatId,
    dateFormat,
  };
}
