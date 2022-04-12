/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Gateway } from 'common/interfaces/statics';
import { useStaticsQuery } from 'common/queries/statics';
import { useEffect, useState } from 'react';

export function useGateways() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const { data: statics } = useStaticsQuery();

  useEffect(() => {
    if (statics?.data.gateways) {
      setGateways(() =>
        statics.data.gateways.filter((gateway: Gateway) => gateway.visible)
      );
    }
  }, [statics]);

  return gateways;
}
