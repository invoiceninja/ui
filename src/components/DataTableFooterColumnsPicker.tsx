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
import { FooterColumns } from './DataTable';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './forms';
import Toggle from './forms/Toggle';
import { Element } from './cards';
import {
  ReactTableColumns,
  useReactSettings,
  useSaveReactSettings,
} from '$app/common/hooks/useReactSettings';
import { toast } from '$app/common/helpers/toast/toast';
import { TableColumns } from './icons/TableColumns';
import { useColorScheme } from '$app/common/colors';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';

interface Props {
  table: ReactTableColumns;
  columns: FooterColumns;
}

export function DataTableFooterColumnsPicker(props: Props) {
  const [t] = useTranslation();

  const { table, columns } = props;

  const saveSettings = useSaveReactSettings();
  const currentUser = useCurrentUser();
  const reactSettings = useReactSettings();

  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [draftColumns, setDraftColumns] = useState<string[]>([]);

  const savedColumns = reactSettings.table_footer_columns?.[table] || [];

  const openModal = () => {
    setDraftColumns(savedColumns);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setDraftColumns([]);
    setIsModalOpen(false);
  };

  const isColumnChecked = (columnKey: string) => {
    return (isModalOpen ? draftColumns : savedColumns).includes(columnKey);
  };

  const handleChange = (columnKey: string, value: boolean) => {
    setDraftColumns((current) => {
      if (value) {
        return current.includes(columnKey) ? current : [...current, columnKey];
      }

      return current.filter((column) => column !== columnKey);
    });
  };

  const handleSave = () => {
    if (!currentUser?.id || isFormBusy) return;

    toast.processing();
    setIsFormBusy(true);

    saveSettings(`table_footer_columns.${table}`, draftColumns)
      .then(() => {
        toast.success('updated_settings');
        closeModal();
      })
      .catch(() => toast.dismiss())
      .finally(() => setIsFormBusy(false));
  };

  return (
    <>
      <Button className="shadow-sm" type="secondary" onClick={openModal}>
        <div className="flex items-center space-x-2">
          <TableColumns size="1.3rem" color={colors.$3} />

          <span className="hidden 2xl:flex">
            {t('footer')} {t('columns')}
          </span>
        </div>
      </Button>

      <Modal title={t('footer')} visible={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col">
          {columns.map((column, index) => (
            <Element
              key={index}
              leftSide={column.label}
              noExternalPadding
              withoutWrappingLeftSide
              pushContentToRight
            >
              <Toggle
                checked={isColumnChecked(column.id)}
                onValueChange={(value) => handleChange(column.id, value)}
              />
            </Element>
          ))}
        </div>

        <Button behavior="button" onClick={handleSave} disabled={isFormBusy}>
          {t('save')}
        </Button>
      </Modal>
    </>
  );
}
