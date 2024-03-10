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
import { CompanyUser } from '$app/common/interfaces/company-user';
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
import {
  ReactTableColumns,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { useInjectUserChanges } from '$app/common/hooks/useInjectUserChanges';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Icon } from './icons/Icon';

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

  useInjectUserChanges();

  const reactSettings = useReactSettings();

  const [filteredColumns, setFilteredColumns] = useState(props.columns);

  const [currentColumns, setCurrentColumns] = useState<string[]>(
    reactSettings?.react_table_columns?.[table as ReactTableColumns] ||
      defaultColumns
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
      `company_user.react_settings.react_table_columns.${table}`,
      currentColumns
    );

    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: user.id }),
      user
    ).then((response: GenericSingleResourceResponse<CompanyUser>) => {
      set(user, 'company_user', response.data.data);
      setIsModalVisible(false);

      $refetch(['company_users']);

      dispatch(updateUser(user));

      toast.success('saved_settings');
    });
  };

  const handleDelete = (columnKey: string) => {
    const updatedCurrentColumns = currentColumns.filter(
      (columns) => !columns.includes(columnKey)
    );

    setCurrentColumns(updatedCurrentColumns);

    const updatedFilteredColumns = props.columns.filter((column) =>
      Boolean(
        !updatedCurrentColumns.find((currentColumn) => currentColumn === column)
      )
    );

    setFilteredColumns(updatedFilteredColumns);
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

    setFilteredColumns(props.columns);
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
          cypressRef="columSelector"
        >
          {filteredColumns.map((column, index) => (
            <option key={index} value={column}>
              {t(column)}
            </option>
          ))}
        </SelectField>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="columns"
            renderClone={(provided, _, rubric) => {
              const column = currentColumns[rubric.source.index];

              return (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div className="flex space-x-2 items-center">
                    <Icon element={MdClose} size={20} />

                    <p>{t(column)}</p>
                  </div>

                  <div {...provided.dragHandleProps}>
                    <Icon element={MdDragHandle} size={23} />
                  </div>
                </div>
              );
            }}
          >
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
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex space-x-2 items-center">
                          <Icon
                            className="cursor-pointer"
                            element={MdClose}
                            size={20}
                            onClick={() => handleDelete(column)}
                          />

                          <p>{t(column)}</p>
                        </div>

                        <div {...provided.dragHandleProps}>
                          <Icon element={MdDragHandle} size={23} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

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
