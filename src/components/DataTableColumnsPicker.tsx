/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { CompanyUser, ReactTableColumns } from '$app/common/interfaces/company-user';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { User } from '$app/common/interfaces/user';
import { updateUser } from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { cloneDeep, set } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, SelectField } from './forms';
import { Inline } from './Inline';
import { Modal } from './Modal';
import { MdDragHandle, MdClose } from 'react-icons/md';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';

interface Props {
  columns: string[];
  defaultColumns: string[];
  table: ReactTableColumns;
}

export function DataTableColumnsPicker(props: Props) {
  const currentUser = useSelector((state: RootState) => state.user.user) as
    | User
    | undefined;

  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { table, defaultColumns } = props;

  const [filteredColumns, setFilteredColumns] = useState(props.columns);

  const [currentColumns, setCurrentColumns] = useState<string[]>(
    currentUser?.company_user?.settings?.react_table_columns?.[
      table as ReactTableColumns
    ] || defaultColumns
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

    set(
      user,
      `company_user.settings.react_table_columns.${table}`,
      currentColumns
    );

    toast.processing();

    request('PUT', endpoint('/api/v1/company_users/:id', { id: user.id }), user)
      .then((response: GenericSingleResourceResponse<CompanyUser>) => {
        set(user, 'company_user', response.data.data);
        setIsModalVisible(false);

        dispatch(updateUser(user));

        toast.success('saved_settings');
      })
      .catch((error) => {
        toast.error();

        console.error(error);
      });
  };

  const handleDelete = (column: string) => {
    setCurrentColumns((current) =>
      current.filter((columns) => !columns.includes(column))
    );
  };

  const onDragEnd = (result: DropResult) => {
    const sorted = arrayMoveImmutable(
      currentColumns,
      result.source.index,
      result.destination?.index as unknown as number
    );

    setCurrentColumns(sorted);
  };

  const handleReset = useCallback(() => {
    setCurrentColumns(defaultColumns);
  }, []);

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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {currentColumns.map((column, index) => (
                    <Draggable
                      key={index}
                      draggableId={`item-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="w-full inline-flex items-center justify-between pr-4 my-2"
                        >
                          <div className="space-x-2 inline-flex items-center">
                            <button onClick={() => handleDelete(column)}>
                              <MdClose size={20} />
                            </button>
                            <p>{t(column)}</p>
                          </div>
                          <button className="cursor-grab">
                            <MdDragHandle size={20} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="flex lg:flex-row lg:justify-end">
          <Inline>
            <Button type="minimal" className="mx-2" onClick={handleReset}>
              {t('reset')}
            </Button>

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
