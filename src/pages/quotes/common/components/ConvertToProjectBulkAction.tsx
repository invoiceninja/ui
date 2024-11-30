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
import { Button } from '$app/components/forms';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { useBulkAction } from '../hooks/useBulkAction';
import { useColorScheme } from '$app/common/colors';
import { EntityActionElement } from '$app/components/EntityActionElement';

interface Props {
  selectedIds: string[];
  setSelected?: Dispatch<SetStateAction<string[]>>;
  disablePreventNavigation?: boolean;
  dropdown: boolean;
}
export const ConvertToProjectBulkAction = (props: Props) => {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { selectedIds, setSelected, dropdown } = props;
  const colors = useColorScheme();
  const bulk = useBulkAction();

  return (
    <>
      <EntityActionElement
        entity="quote"
        actionKey="convert_to_project"
        isCommonActionSection={!dropdown}
        tooltipText={t('convert_to_project')}
        onClick={() => setIsModalOpen(true)}
        icon={MdOutlineCreateNewFolder}
        disablePreventNavigation={props.disablePreventNavigation}
      >
        {t('convert_to_project')}
      </EntityActionElement>

      <Modal
        title={t('convert_to_project')}
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
