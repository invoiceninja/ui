/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Vendor } from '$app/common/interfaces/vendor';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateVendorForm } from './CreateVendorForm';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  onVendorCreated: (vendor: Vendor) => unknown;
}

export function CreateVendorModal(props: Props) {
  const [t] = useTranslation();

  const [fundamentalConceptVisible, setFundamentalConceptVisible] =
    useState<boolean>(true);

  return (
    <Modal
      title={t('create_vendor')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      size={fundamentalConceptVisible ? 'extraSmall' : 'large'}
      renderTransitionChildAsFragment
      overflowVisible
    >
      <CreateVendorForm
        setSelectedIds={props.setSelectedIds}
        setVisible={props.setVisible}
        onVendorCreated={props.onVendorCreated}
        fundamentalConceptVisible={fundamentalConceptVisible}
        setFundamentalConceptVisible={setFundamentalConceptVisible}
      />
    </Modal>
  );
}
