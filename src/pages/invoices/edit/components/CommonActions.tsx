/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { CommonActionsPreferenceModal } from '$app/components/CommonActionsPreferenceModal';
import { Icon } from '$app/components/icons/Icon';
import { useEffect, useState } from 'react';
import { MdSettings } from 'react-icons/md';
import { useActions } from './Actions';
import { ResourceAction } from '$app/components/DataTable';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';

interface Props {
  invoice: Invoice;
}
export function CommonActions(props: Props) {
  const user = useCurrentUser();
  const actions = useActions({ dropdown: false });

  const { invoice } = props;

  const [isPreferenceModalOpen, setIsPreferenceModalOpen] =
    useState<boolean>(false);

  const [selectedActions, setSelectedActions] =
    useState<ResourceAction<Invoice>[]>();

  useEffect(() => {
    const currentActions =
      user?.company_user?.react_settings?.common_actions?.invoice;

    if (currentActions) {
      const selected = actions
        .filter((action) =>
          currentActions.includes(
            (action as ResourceAction<Invoice>)(invoice)?.key as string
          )
        )
        .sort((a, b) => {
          return (
            currentActions.indexOf(
              String((a as ResourceAction<Invoice>)(invoice)?.key) ?? ''
            ) -
            currentActions.indexOf(
              String((b as ResourceAction<Invoice>)(invoice)?.key) ?? ''
            )
          );
        });

      setSelectedActions(selected as ResourceAction<Invoice>[]);
    }
  }, [user, invoice]);

  return (
    <>
      <div className="flex items-center space-x-4">
        {selectedActions?.map((action, index) => (
          <div key={index}>{action(invoice)}</div>
        ))}

        <div>
          <Icon
            className="cursor-pointer"
            element={MdSettings}
            size={25}
            onClick={() => setIsPreferenceModalOpen(true)}
          />
        </div>
      </div>

      <CommonActionsPreferenceModal
        entity="invoice"
        visible={isPreferenceModalOpen}
        setVisible={setIsPreferenceModalOpen}
      />
    </>
  );
}
