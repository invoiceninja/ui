/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Gateway } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { useEffect, useState } from 'react';

export function useGateways() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const { data: statics } = useStaticsQuery();

  useEffect(() => {
    if (statics?.gateways) {
      setGateways(() =>
        statics.gateways
          .filter((gateway) => gateway.visible)
          .sort((x, y) => (x.sort_order > y.sort_order ? 1 : -1))
      );
    }
  }, [statics]);

  return gateways;
}
