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
import { ReactTableColumns } from '$app/common/hooks/useReactSettings';
import { useHandleCurrentUserChangeProperty } from '$app/common/hooks/useHandleCurrentUserChange';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { cloneDeep, set } from 'lodash';
import { $refetch } from '$app/common/hooks/useRefetch';
import { updateUser } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { toast } from '$app/common/helpers/toast/toast';
import { User } from '$app/common/interfaces/user';

interface Props {
  table: ReactTableColumns;
  columns: FooterColumns;
}

export function DataTableFooterColumnsPicker(props: Props) {
  const [t] = useTranslation();

  const { table, columns } = props;

  const dispatch = useDispatch();
  const handleCurrentUserChangeProperty = useHandleCurrentUserChangeProperty();

  const userChanges = useInjectUserChanges();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isColumnChecked = (columnKey: string) => {
    return Boolean(
      userChanges?.company_user?.react_settings?.table_footer_columns?.[
        table
      ]?.includes(columnKey)
    );
  };

  const handleChange = (columnKey: string, value: boolean) => {
    let currentList =
      userChanges?.company_user?.react_settings.table_footer_columns?.[table] ||
      [];

    if (value) {
      currentList = [...currentList, columnKey];
    } else {
      currentList = currentList.filter((column) => column !== columnKey);
    }

    handleCurrentUserChangeProperty(
      `company_user.react_settings.table_footer_columns.${table}`,
      currentList as keyof typeof userChanges
    );
  };

  const handleSave = () => {
    const updatedUser = cloneDeep(userChanges) as User;

    if (updatedUser && !isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request(
        'PUT',
        endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
        updatedUser
      )
        .then((response: GenericSingleResourceResponse<CompanyUser>) => {
          toast.success('updated_settings');

          set(updatedUser, 'company_user', response.data.data);

          $refetch(['company_users']);

          dispatch(updateUser(userChanges));

          setIsModalOpen(false);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  return (
    <>
      <div
        className="text-sm cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {t('footer')}
      </div>

      <Modal
        title={t('footer')}
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
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

        <Button behavior="button" onClick={handleSave}>
          {t('save')}
        </Button>
      </Modal>
    </>
  );
}
