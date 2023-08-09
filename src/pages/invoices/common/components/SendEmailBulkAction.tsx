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
import { SendEmailModal } from './SendEmailModal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';

interface Props {
  invoiceIds: string[];
}

export function SendEmailBulkAction(props: Props) {
  const { invoiceIds } = props;

  const [t] = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <>
      <SendEmailModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        invoiceIds={invoiceIds}
      />

      <DropdownElement
        onClick={() => setIsModalVisible(true)}
        icon={<Icon element={MdSend} />}
      >
        {t('send_email')}
      </DropdownElement>
    </>
  );
}
