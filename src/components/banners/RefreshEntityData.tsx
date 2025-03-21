/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Popover } from '@headlessui/react';
import { atom, useAtom } from 'jotai';
import { Button } from '../forms';
import { useTranslation } from 'react-i18next';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useParams } from 'react-router-dom';

export const refreshEntityDataBannerAtom = atom<{
  refetchEntityId: string;
  refetchEntity: 'invoices' | 'recurring_invoices';
  visible: boolean;
}>({
  refetchEntityId: '',
  refetchEntity: 'recurring_invoices',
  visible: false,
});

export function RefreshEntityData() {
  const [t] = useTranslation();

  const { id } = useParams();

  const [refreshEntityDataBanner, setRefreshEntityDataBanner] = useAtom(
    refreshEntityDataBannerAtom
  );

  if (
    !refreshEntityDataBanner.visible ||
    !id ||
    id !== refreshEntityDataBanner.refetchEntityId
  ) {
    return null;
  }

  return (
    <Popover className="relative">
      <div className="max-w-max rounded-lg bg-[#FCD34D] px-6 py-4 shadow-lg">
        <div className="flex items-center justify-center space-x-3 max-w-[35rem]">
          <span className="text-sm">{t('updated_entity_data')}.</span>

          <Button
            behavior="button"
            type="secondary"
            className="whitespace-nowrap"
            onClick={() => {
              $refetch([refreshEntityDataBanner.refetchEntity]);

              setRefreshEntityDataBanner({
                refetchEntityId: '',
                refetchEntity: 'recurring_invoices',
                visible: false,
              });
            }}
          >
            {t('refresh_data')}
          </Button>
        </div>
      </div>
    </Popover>
  );
}
