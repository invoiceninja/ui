import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hasContactWithEmail } from '$app/common/helpers/emails/has-contact-with-email';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ErrorMessage } from '$app/components/ErrorMessage';
import { ContactEmailModal } from '$app/components/emails/ContactEmailModal';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useSave } from '../hooks';

interface Props {
  recurringInvoice: RecurringInvoice | undefined;
  children: ReactNode;
}

export function SendNowAction({ recurringInvoice, children }: Props) {
  const [t] = useTranslation();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isContactEmailOpen, setIsContactEmailOpen] = useState<boolean>(false);

  const save = useSave({
    setIsFormBusy,
    setErrors,
    isFormBusy,
    onSuccess: () => setIsModalVisible(false),
  });

  const hasEmail = hasContactWithEmail(recurringInvoice?.client?.contacts);

  return (
    <>
      <div
        onClick={() =>
          hasEmail ? setIsModalVisible(true) : setIsContactEmailOpen(true)
        }
      >
        {children}
      </div>

      <Modal
        title={t('are_you_sure')}
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
        }}
        disableClosing={isFormBusy}
      >
        <ErrorMessage>{errors?.errors.next_send_date}</ErrorMessage>

        <Button
          behavior="button"
          onClick={() => recurringInvoice && save(recurringInvoice, 'send_now')}
          disabled={isFormBusy}
        >
          {t('continue')}
        </Button>
      </Modal>

      <ContactEmailModal
        visible={isContactEmailOpen}
        onClose={() => setIsContactEmailOpen(false)}
        relation="client"
        relationId={recurringInvoice?.client_id}
      />
    </>
  );
}
