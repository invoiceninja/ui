/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, useState } from 'react';
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
import { cloneDeep } from 'lodash';

interface Props {
  layoutBreakpoint: string | undefined;
  setLayouts: Dispatch<SetStateAction<DashboardGridLayouts>>;
  updateLayoutHeight: () => void;
}

export function RestoreLayoutAction(props: Props) {
  const { layoutBreakpoint, setLayouts, updateLayoutHeight } = props;

  const setIsModalVisible = useSetAtom(confirmActionModalAtom);

  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  if (!layoutBreakpoint) {
    return null;
  }

  return (
    <>
      <ConfirmActionModal
        onClick={() => {
          layoutBreakpoint &&
            setLayouts((currentLayouts) =>
              cloneDeep({
                ...currentLayouts,
                [layoutBreakpoint]:
                  initialLayouts[
                    layoutBreakpoint as keyof typeof initialLayouts
                  ],
              })
            );

          setIsRestoring(true);

          updateLayoutHeight();

          setTimeout(() => {
            setIsRestoring(false);
            setIsModalVisible(false);
          }, 300);
        }}
        disabledButton={isRestoring}
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
