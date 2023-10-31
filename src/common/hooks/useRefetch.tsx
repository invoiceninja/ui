/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';

const keys = {
  invoices: {
    path: '/api/v1/invoices',
    dependencies: [],
  },
};

export function useRefetch() {
  const queryClient = useQueryClient();

  return (property: Array<keyof typeof keys>) => {
    property.map((key) => {
      queryClient.invalidateQueries(keys[key].path);

      keys[key].dependencies.map((dependency) => {
        queryClient.invalidateQueries(dependency);
      });
    });
  };
}
