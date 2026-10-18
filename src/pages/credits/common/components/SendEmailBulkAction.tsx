/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { hasContactWithEmail } from '$app/common/helpers/emails/has-contact-with-email';
import { Credit } from '$app/common/interfaces/credit';
import { useBulk } from '$app/common/queries/credits';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';

interface Props {
  selectedIds: string[];
  selectedCredits: Credit[];
  setSelected: Dispatch<SetStateAction<string[]>>;
}
export const SendEmailBulkAction = (props: Props) => {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isContactEmailOpen, setContactEmailOpen] = useState<boolean>(false);

  const { selectedIds, selectedCredits, setSelected } = props;

  const bulk = useBulk();
  const colors = useColorScheme();

  const haveClientsEmailContacts = () => {
    return selectedCredits.every(({ client }) =>
      hasContactWithEmail(client?.contacts)
    );
  };

  const getCreditWithoutClientContacts = () => {
    return selectedCredits.find(
      ({ client }) => !hasContactWithEmail(client?.contacts)
    );
  };

  return (
    <>
      <DropdownElement
        onClick={() =>
          haveClientsEmailContacts()
            ? setIsModalOpen(true)
            : setContactEmailOpen(true)
        }
        icon={<Icon element={MdSend} />}
      >
        {t('send_email')}
      </DropdownElement>

      <Modal
        title={t('bulk_email_credits')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <span
          className="text-lg"
          style={{
            backgroundColor: colors.$2,
            color: colors.$3,
            colorScheme: colors.$0,
          }}
        >
          {t('are_you_sure')}
        </span>

        <div className="flex justify-end space-x-4 mt-5">
          <Button
            behavior="button"
            onClick={() => {
              bulk(selectedIds, 'email');

              setSelected([]);

              setIsModalOpen(false);
            }}
          >
            {t('yes')}
          </Button>
        </div>
      </Modal>

      <ContactEmailModal
        visible={isContactEmailOpen}
        onClose={() => setContactEmailOpen(false)}
        relation="client"
        relationId={getCreditWithoutClientContacts()?.client_id}
      />
    </>
  );
};
