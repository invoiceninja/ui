/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useStaticsQuery } from '../../queries/statics';

export function useResolveDateFormat() {
  const statics = useStaticsQuery();

  return (id: string) => {
    if (statics) {
      return statics.data?.date_formats.find(
        (dateFormat) => dateFormat.id === id
      );
    }

    return undefined;
  };
}
