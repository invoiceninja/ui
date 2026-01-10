import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSave } from '../hooks';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ErrorMessage } from '$app/components/ErrorMessage';

interface Props {
  recurringInvoice: RecurringInvoice | undefined;
  children: ReactNode;
}

export function SendNowAction({ recurringInvoice, children }: Props) {
  const [t] = useTranslation();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const save = useSave({
    setIsFormBusy,
    setErrors,
    isFormBusy,
    onSuccess: () => setIsModalVisible(false),
  });

  return (
    <>
      <div onClick={() => setIsModalVisible(true)}>{children}</div>

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
    </>
  );
}
