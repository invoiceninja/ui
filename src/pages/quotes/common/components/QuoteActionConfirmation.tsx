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
import { useTranslation } from 'react-i18next';
import { MdCancel, MdDone, MdMarkEmailRead } from 'react-icons/md';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';

type QuoteAction = 'mark_sent' | 'approve' | 'cancel';

const icons = {
  mark_sent: MdMarkEmailRead,
  approve: MdDone,
  cancel: MdCancel,
};

const actionKeys = {
  mark_sent: 'mark_sent',
  approve: 'approve',
  cancel: 'cancel_quote',
};

interface Props {
  action: QuoteAction;
  onConfirm: () => void;
  bulkAction?: boolean;
  dropdown?: boolean;
}

export function QuoteActionConfirmation(props: Props) {
  const [t] = useTranslation();

  const { action, onConfirm, bulkAction, dropdown = true } = props;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const label = t(action) as string;

  return (
    <>
      {bulkAction ? (
        <DropdownElement
          onClick={() => setIsModalVisible(true)}
          icon={<Icon element={icons[action]} />}
        >
          {label}
        </DropdownElement>
      ) : (
        <EntityActionElement
          entity="quote"
          actionKey={actionKeys[action]}
          isCommonActionSection={!dropdown}
          tooltipText={label}
          onClick={() => setIsModalVisible(true)}
          icon={icons[action]}
          disablePreventNavigation
        >
          {label}
        </EntityActionElement>
      )}

      <Modal
        title={label}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <span className="text-lg text-gray-900">{t('are_you_sure')}</span>

        <div className="flex justify-end space-x-4 mt-5">
          <Button
            behavior="button"
            onClick={() => {
              onConfirm();

              setIsModalVisible(false);
            }}
          >
            <span className="text-base mx-3">{t('yes')}</span>
          </Button>
        </div>
      </Modal>
    </>
  );
}
