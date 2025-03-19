/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { useBulkAction } from '../queries';
import { MdSync } from 'react-icons/md';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { EntityActionElement } from '$app/components/EntityActionElement';

interface Props {
  selectedIds: string[];
  setSelected?: Dispatch<SetStateAction<string[]>>;
  dropdown: boolean;
}

export const UpdatePricesAction = (props: Props) => {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOnUpdatedPrices = () => {
    setIsModalOpen(false);
  };

  const bulk = useBulkAction({ onSuccess: handleOnUpdatedPrices });

  const { selectedIds, setSelected, dropdown } = props;

  const handleSave = () => {
    bulk(selectedIds, 'update_prices');

    setSelected?.([]);
  };

  return (
    <>
      <EntityActionElement
        entity="recurring_invoice"
        actionKey="update_prices"
        isCommonActionSection={!dropdown}
        tooltipText={t('update_prices')}
        onClick={() => setIsModalOpen(true)}
        icon={MdSync}
      >
        {t('update_prices')}
      </EntityActionElement>

      <Modal
        title={t('update_prices')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <span className="text-lg">{t('are_you_sure')}</span>

        <Button className="self-end" onClick={handleSave}>
          {t('yes')}
        </Button>
      </Modal>
    </>
  );
};
