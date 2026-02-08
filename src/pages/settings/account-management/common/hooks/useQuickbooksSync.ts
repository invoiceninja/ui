/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';

interface SyncSelections {
  product: boolean;
  client: boolean;
  invoice: boolean;
}

export function useQuickbooksSync() {
  const [syncSelections, setSyncSelections] = useState<SyncSelections>({
    product: false,
    client: false,
    invoice: false,
  });

  const [isSyncBusy, setIsSyncBusy] = useState<boolean>(false);
  const [isSyncInfoModalVisible, setIsSyncInfoModalVisible] =
    useState<boolean>(false);

  const hasSyncSelection =
    syncSelections.product || syncSelections.client || syncSelections.invoice;

  const setSyncSelection = (key: keyof SyncSelections, value: boolean) => {
    setSyncSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleInitialSync = () => {
    if (isSyncBusy || !hasSyncSelection) return;

    setIsSyncBusy(true);
    toast.processing();

    request('POST', endpoint('/api/v1/quickbooks/sync'), {
      product: syncSelections.product,
      client: syncSelections.client,
      invoice: syncSelections.invoice,
    })
      .then(() => {
        toast.success('synced');

        setSyncSelections({ product: false, client: false, invoice: false });
        setIsSyncInfoModalVisible(true);
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => {
        setIsSyncBusy(false);
      });
  };

  return {
    syncSelections,
    setSyncSelection,
    handleInitialSync,
    isSyncBusy,
    isSyncInfoModalVisible,
    setIsSyncInfoModalVisible,
    hasSyncSelection,
  };
}
