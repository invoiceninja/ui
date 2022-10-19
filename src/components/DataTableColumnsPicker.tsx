/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { User } from 'common/interfaces/user';
import { RootState } from 'common/stores/store';
import { cloneDeep, set } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Button, SelectField } from './forms';
import { Inline } from './Inline';
import { Modal } from './Modal';

interface Props {
  columns: string[];
  defaultColumns: string[];
  table: string;
}

export function DataTableColumnsPicker(props: Props) {
  const currentUser = useSelector((state: RootState) => state.user.user) as
    | User
    | undefined;

  const { t } = useTranslation();
  const { table } = props;

  const [filteredColumns, setFilteredColumns] = useState(props.columns);

  const [currentColumns, setCurrentColumns] = useState<string[]>(
    currentUser?.company_user?.settings?.react_table_columns?.[table] || []
  );

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    setFilteredColumns((current) =>
      current.filter((column) => !currentColumns.includes(column))
    );
  }, [currentColumns]);

  const handleSelectChange = useCallback((value: string) => {
    value.length > 1 && setCurrentColumns((current) => [...current, value]);
  }, []);

  const onSave = () => {
    const user = cloneDeep(currentUser) as User;

    console.log(user);

    set(
      user,
      `company_user.settings.react_table_columns.${table}`,
      currentColumns
    );

    // toast.processing();

    request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), user)
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  };

  return (
    <>
      <Modal
        title={t('edit_columns')}
        visible={isModalVisible}
        onClose={setIsModalVisible}
      >
        <SelectField
          label={t('add_column')}
          onValueChange={handleSelectChange}
          value=""
          withBlank
        >
          {filteredColumns.map((column, index) => (
            <option key={index} value={column}>
              {t(column)}
            </option>
          ))}
        </SelectField>

        <div className="max-h-64 overflow-y-auto">
          {currentColumns.map((column, index) => (
            <p key={index}>{t(column)}</p>
          ))}
        </div>

        <div className="flex lg:flex-row lg:justify-end">
          <Inline>
            <Button onClick={onSave}>{t('save')}</Button>
          </Inline>
        </div>
      </Modal>

      <button
        className="hidden lg:block lg:mx-4 text-sm"
        onClick={() => setIsModalVisible(true)}
      >
        {t('columns')}
      </button>
    </>
  );
}
