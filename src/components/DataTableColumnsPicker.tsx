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
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { RootState } from '$app/common/stores/store';
import { cloneDeep, set } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, InputLabel, SelectField } from './forms';
import { Inline } from './Inline';
import { Modal } from './Modal';
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
import { createPortal } from 'react-dom';
import { GridDotsVertical } from './icons/GridDotsVertical';
import { useColorScheme } from '$app/common/colors';
import { CircleXMark } from './icons/CircleXMark';

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

  const [t] = useTranslation();
  const { table, defaultColumns } = props;

  useInjectUserChanges();

  const colors = useColorScheme();
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
      dispatch(resetChanges());

      toast.success('saved_settings');
    });
  };

  const handleDelete = (columnKey: string) => {
    const updatedCurrentColumns = currentColumns.filter(
      (column) => column !== columnKey
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
      {createPortal(
        <Modal
          title={t('edit_columns')}
          visible={isModalVisible}
          onClose={setIsModalVisible}
        >
          <div className="flex flex-col">
            <SelectField
              className="shadow-sm"
              label={t('add_column')}
              onValueChange={handleSelectChange}
              value=""
              withBlank
              customSelector
              cypressRef="columSelector"
            >
              {filteredColumns
                .sort((a, b) => t(a).localeCompare(t(b)))
                .map((column, index) => (
                  <option key={index} value={column}>
                    {t(column)}
                  </option>
                ))}
            </SelectField>

            <InputLabel className="mt-4">{t('order_columns')}</InputLabel>

            <div className="mt-3">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId="columns"
                  renderClone={(provided, _, rubric) => {
                    const column = currentColumns[rubric.source.index];

                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center justify-between py-[0.4rem] text-sm"
                      >
                        <div className="flex space-x-2 items-center">
                          <div {...provided.dragHandleProps}>
                            <GridDotsVertical
                              size="1.2rem"
                              color={colors.$17}
                            />
                          </div>

                          <p style={{ color: colors.$3 }}>{t(column)}</p>
                        </div>

                        <CircleXMark
                          color={colors.$16}
                          hoverColor={colors.$3}
                          borderColor={colors.$5}
                          hoverBorderColor={colors.$17}
                          size="1.6rem"
                        />
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
                              className="flex items-center justify-between py-[0.4rem]"
                            >
                              <div className="flex space-x-2 items-center">
                                <div {...provided.dragHandleProps}>
                                  <GridDotsVertical
                                    size="1.2rem"
                                    color={colors.$17}
                                  />
                                </div>

                                <p style={{ color: colors.$3 }}>{t(column)}</p>
                              </div>

                              <div
                                className="cursor-pointer"
                                onClick={() => handleDelete(column)}
                              >
                                <CircleXMark
                                  color={colors.$16}
                                  hoverColor={colors.$3}
                                  borderColor={colors.$5}
                                  hoverBorderColor={colors.$17}
                                  size="1.6rem"
                                />
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
            </div>

            <div className="flex mt-4 lg:flex-row lg:justify-end">
              <Inline>
                <Button type="secondary" onClick={handleReset}>
                  {t('reset')}
                </Button>

                <Button onClick={onSave}>{t('save')}</Button>
              </Inline>
            </div>
          </div>
        </Modal>,
        document.body
      )}

      <div className="mr-2">
        <Button type="secondary" onClick={() => setIsModalVisible(true)}>
          {t('columns')}
        </Button>
      </div>
    </>
  );
}
