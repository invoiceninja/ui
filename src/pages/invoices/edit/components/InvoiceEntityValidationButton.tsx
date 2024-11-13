/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { useCheckEInvoiceValidation } from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheckCircle } from 'react-icons/md';

interface Props {
  id: string | undefined;
}

export function InvoiceEntityValidationButton(props: Props) {
  const [t] = useTranslation();

  const { id } = props;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentErrors, setCurrentErrors] = useState<string[]>([]);
  const [checkValidation, setCheckValidation] = useState<boolean>(false);

  const { validationResponse } = useCheckEInvoiceValidation({
    entityId: id as string,
    enableQuery: Boolean(id?.length && checkValidation),
    checkInvoiceOnly: true,
    withToaster: true,
    onFinished: () => {
      setCheckValidation(false);
      setIsModalOpen(true);
    },
  });

  useEffect(() => {
    if (validationResponse) {
      setCurrentErrors(validationResponse.invoice);
    }
  }, [validationResponse]);

  return (
    <>
      <Button
        behavior="button"
        onClick={() => setCheckValidation(true)}
        disabled={checkValidation}
        disableWithoutIcon
      >
        {t('check_invoice')}
      </Button>

      <Modal
        title={currentErrors.length ? t('error') : t('status')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {currentErrors.length ? (
          <div className="flex flex-col space-y-2">
            {currentErrors.map((error, index) => (
              <span key={index}>{error}</span>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <Icon element={MdCheckCircle} size={50} color="green" />
          </div>
        )}
      </Modal>
    </>
  );
}
