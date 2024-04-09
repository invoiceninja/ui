/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from '$app/common/interfaces/client';
import { useBulk } from '$app/common/queries/clients';
import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { GroupSettingsSelector } from '$app/components/group-settings/GroupSettingsSelector';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdGroup } from 'react-icons/md';

interface Props {
  clients: Client[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}
export function AssignToGroupBulkAction(props: Props) {
  const [t] = useTranslation();

  const { clients, setSelected } = props;

  const bulk = useBulk();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [groupSettingsId, setGroupSettingsId] = useState<string>('');

  const handleOnClose = () => {
    setIsModalOpen(false);
    setGroupSettingsId('');
  };

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={MdGroup} />}
      >
        {t('assign_group')}
      </DropdownElement>

      <Modal
        title={t('group')}
        visible={isModalOpen}
        onClose={handleOnClose}
        overflowVisible
      >
        <GroupSettingsSelector
          value={groupSettingsId}
          onChange={(value) => setGroupSettingsId(value.id)}
          onClearButtonClick={() => setGroupSettingsId('')}
        />

        <Button
          behavior="button"
          onClick={() => {
            bulk(
              clients.map(({ id }) => id),
              'assign_group',
              groupSettingsId
            ).then(() => handleOnClose());

            setSelected([]);
          }}
          disabled={!groupSettingsId}
          disableWithoutIcon
        >
          {t('add_to_group')}
        </Button>
      </Modal>
    </>
  );
}
