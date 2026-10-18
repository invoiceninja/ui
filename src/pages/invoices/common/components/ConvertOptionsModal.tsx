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
import { MdSwitchRight } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Invoice } from '$app/common/interfaces/invoice';
import { CloneOption } from '$app/components/CloneOption';
import { EntityActionElement } from '$app/components/EntityActionElement';
import { FileClock } from '$app/components/icons/FileClock';
import { Modal } from '$app/components/Modal';
import { useConvertToPurchaseOrder } from '../hooks/useConvertToPurchaseOrder';

interface Props {
  invoice: Invoice;
  dropdown: boolean;
}

export function ConvertOptionsModal({ invoice, dropdown }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const hasPermission = useHasPermission();

  const convertToPurchaseOrder = useConvertToPurchaseOrder({
    entity: 'invoice',
  });

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <>
      {hasPermission('create_purchase_order') && (
        <EntityActionElement
          entity="invoice"
          actionKey="convert_to"
          isCommonActionSection={!dropdown}
          tooltipText={t('convert_to')}
          onClick={() => setIsModalVisible(true)}
          icon={MdSwitchRight}
          disablePreventNavigation
        >
          {t('convert_to')}
        </EntityActionElement>
      )}

      <Modal
        title={t('convert_to')}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <div className="flex justify-center">
          <div className="flex flex-1 flex-col items-center space-y-3">
            {hasPermission('create_purchase_order') ? (
              <CloneOption
                label={t('purchase_order')}
                iconElement={<FileClock size="1.1rem" color={colors.$3} />}
                onClick={() => {
                  convertToPurchaseOrder([invoice.id]);

                  setIsModalVisible(false);
                }}
              />
            ) : null}
          </div>
        </div>
      </Modal>
    </>
  );
}
