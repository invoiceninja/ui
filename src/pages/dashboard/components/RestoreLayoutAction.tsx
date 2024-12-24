/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch } from 'react';
import { initialLayouts } from './ResizableDashboardCards';
import { MdRefresh } from 'react-icons/md';
import { DashboardGridLayouts } from './ResizableDashboardCards';
import { SetStateAction } from 'react';
import { Icon } from '$app/components/icons/Icon';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';
import { useSetAtom } from 'jotai';

interface Props {
  layoutBreakpoint: string | undefined;
  updateLayoutHeight: () => void;
  setLayouts: Dispatch<SetStateAction<DashboardGridLayouts>>;
}

export function RestoreLayoutAction(props: Props) {
  const { layoutBreakpoint, updateLayoutHeight, setLayouts } = props;

  const setIsModalVisible = useSetAtom(confirmActionModalAtom);

  if (!layoutBreakpoint) {
    return null;
  }

  return (
    <>
      <ConfirmActionModal
        onClick={() => {
          layoutBreakpoint &&
            setLayouts((currentLayouts) => ({
              ...currentLayouts,
              [layoutBreakpoint]:
                initialLayouts[layoutBreakpoint as keyof typeof initialLayouts],
            }));

          setIsModalVisible(false);

          setTimeout(() => {
            updateLayoutHeight();
          }, 100);
        }}
      />

      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsModalVisible(true)}
      >
        <Icon element={MdRefresh} size={23} />
      </div>
    </>
  );
}
