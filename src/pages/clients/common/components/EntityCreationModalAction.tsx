/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Client } from '$app/common/interfaces/client';
import { CloneOption } from '$app/components/CloneOption';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { CreditCard } from '$app/components/icons/CreditCard';
import { Files } from '$app/components/icons/Files';
import { Icon } from '$app/components/icons/Icon';
import { Invoice } from '$app/components/icons/Invoice';
import { Wallet } from '$app/components/icons/Wallet';
import { Modal } from '$app/components/Modal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdControlPointDuplicate } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface Props {
  client: Client;
  dropdown?: boolean;
}

export function EntityCreationModalAction({ client, dropdown }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const navigate = useNavigate();
  const hasPermission = useHasPermission();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleCreateInvoice = () => {
    setIsModalVisible(false);

    setTimeout(() => {
      navigate(route('/invoices/create?client=:id', { id: client.id }));
    }, 150);
  };

  const handleCreatePayment = () => {
    setIsModalVisible(false);

    setTimeout(() => {
      navigate(route('/payments/create?client=:id', { id: client.id }));
    }, 150);
  };

  const handleCreateQuote = () => {
    setIsModalVisible(false);

    setTimeout(() => {
      navigate(route('/quotes/create?client=:id', { id: client.id }));
    }, 150);
  };

  const handleCreateCredit = () => {
    setIsModalVisible(false);

    setTimeout(() => {
      navigate(route('/credits/create?client=:id', { id: client.id }));
    }, 150);
  };

  return (
    <>
      {!client.is_deleted &&
        (hasPermission('create_invoice') ||
          hasPermission('create_payment') ||
          hasPermission('create_quote') ||
          hasPermission('create_credit')) && (
          <DropdownElement
            icon={<Icon element={MdControlPointDuplicate} />}
            onClick={() => setIsModalVisible(true)}
          >
            {t('new_resource')}
          </DropdownElement>
        )}

      <Modal
        title={t('new_resource')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        closeButtonCypressRef="cloneOptionsModalXButton"
      >
        <div className="flex justify-center">
          <div className="flex flex-1 flex-col items-center space-y-3">
            {hasPermission('create_invoice') && (
              <CloneOption
                label={t('invoice')}
                iconElement={<Invoice size="1.1rem" color={colors.$3} />}
                onClick={handleCreateInvoice}
              />
            )}

            {hasPermission('create_payment') && (
              <CloneOption
                label={t('payment')}
                iconElement={<CreditCard size="1.1rem" color={colors.$3} />}
                onClick={handleCreatePayment}
              />
            )}

            {hasPermission('create_quote') && (
              <CloneOption
                label={t('quote')}
                iconElement={<Files size="1.1rem" color={colors.$3} />}
                onClick={handleCreateQuote}
              />
            )}

            {hasPermission('create_credit') && (
              <CloneOption
                label={t('credit')}
                iconElement={<Wallet size="1.1rem" color={colors.$3} />}
                onClick={handleCreateCredit}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
