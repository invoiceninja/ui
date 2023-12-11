/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Modal } from '$app/components/Modal';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSwitchRight } from 'react-icons/md';
import { useBulkAction } from '../hooks/useBulkAction';
import { useColorScheme } from '$app/common/colors';

interface Props {
  selectedIds: string[];
  setSelected?: Dispatch<SetStateAction<string[]>>;
}
export const ConvertToProjectBulkAction = (props: Props) => {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { selectedIds, setSelected } = props;
  const colors = useColorScheme();
  const bulk = useBulkAction();

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={MdSwitchRight} />}
      >
        {t('convert_to_project')}
      </DropdownElement>

      <Modal
        title={t('convert_to_project')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <span className="text-lg"
          style={{ backgroundColor: colors.$2, color: colors.$3, colorScheme: colors.$0 }}
        >{t('are_you_sure')}</span>

        <div className="flex justify-end space-x-4 mt-5">
          <Button
            behavior="button"
            onClick={() => {
              bulk(selectedIds, 'convert_to_project');
              setSelected?.([]);
              setIsModalOpen(false);
            }}
          >
            <span className="text-base mx-3">{t('yes')}</span>
          </Button>
        </div>
      </Modal>
    </>
  );
};
