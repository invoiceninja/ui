import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { Button } from '$app/components/forms';
import { useBulk } from '$app/common/queries/clients';
import { Client } from '$app/common/interfaces/client';
import { route } from '$app/common/helpers/route';
import { useNavigate } from 'react-router-dom';

interface Props {
  client: Client;
}

export function CloneAction({ client }: Props) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const bulk = useBulk({
    onSuccess: (clients) => {
      setIsModalVisible(false);

      setTimeout(() => {
        navigate(route('/clients/:id/edit', { id: clients[0].id }));
      }, 150);
    },
  });

  return (
    <>
      <Modal
        title={t('are_you_sure')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <div className="flex flex-col space-y-6">
          <span className="font-medium text-sm">
            {t('clone_client_description')}
          </span>

          <Button
            behavior="button"
            onClick={() => bulk([client.id], 'clone')}
            disableWithoutIcon
          >
            {t('continue')}
          </Button>
        </div>
      </Modal>

      {Boolean(client && !client.is_deleted) && (
        <DropdownElement
          onClick={() => setIsModalVisible(true)}
          icon={<Icon element={MdControlPointDuplicate} />}
        >
          {t('clone')}
        </DropdownElement>
      )}
    </>
  );
}
