/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { cloneDeep, set } from 'lodash';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';
import { CgOptions } from 'react-icons/cg';
import { CompanyUser } from '$app/common/interfaces/company-user';
import { decodeDashboardField } from '$app/common/helpers/react-settings';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { FieldRow } from './FieldRow';
import { AddFieldModal } from './AddFieldModal';

export const FIELDS_LABELS: Record<string, string> = {
  active_invoices: 'total_active_invoices',
  outstanding_invoices: 'total_outstanding_invoices',
  completed_payments: 'total_completed_payments',
  refunded_payments: 'total_refunded_payments',
  active_quotes: 'total_active_quotes',
  unapproved_quotes: 'total_unapproved_quotes',
  logged_tasks: 'total_logged_tasks',
  invoiced_tasks: 'total_invoiced_tasks',
  paid_tasks: 'total_paid_tasks',
  logged_expenses: 'total_logged_expenses',
  pending_expenses: 'total_pending_expenses',
  invoiced_expenses: 'total_invoiced_expenses',
  invoice_paid_expenses: 'total_invoice_paid_expenses',
};

interface EditState {
  index: number;
  key: string;
}

export function DashboardCardSelector() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const colors = useColorScheme();
  const currentUser = useCurrentUser();

  const [fields, setFields] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [manageOpen, setManageOpen] = useState<boolean>(false);
  const [editState, setEditState] = useState<EditState | null>(null);

  useEffect(() => {
    if (manageOpen && currentUser) {
      setFields(
        currentUser.company_user?.react_settings.dashboard_fields ?? []
      );
    }
  }, [manageOpen, currentUser]);

  const handleSave = () => {
    const updated = cloneDeep(currentUser);

    if (!updated || isFormBusy) {
      return;
    }

    toast.processing();
    setIsFormBusy(true);

    set(updated, 'company_user.react_settings.dashboard_fields', fields);

    request(
      'PUT',
      endpoint('/api/v1/company_users/:id', { id: updated.id }),
      updated
    )
      .then((response: GenericSingleResourceResponse<CompanyUser>) => {
        toast.success('updated_settings');
        set(updated, 'company_user', response.data.data);
        $refetch(['company_users']);
        dispatch(updateUser(updated));
        dispatch(resetChanges());
        setManageOpen(false);
      })
      .finally(() => setIsFormBusy(false));
  };

  const handleRemove = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    if (editState?.index === index) {
      setEditState(null);
    }
  };

  const handleEdit = (index: number) => {
    setEditState({ index, key: fields[index] });
    setAddOpen(true);
  };

  const handleAddOrEdit = (keys: string[]) => {
    if (editState !== null) {
      setFields((prev) =>
        prev.map((k, i) => (i === editState.index ? keys[0] : k))
      );
      setEditState(null);
    } else {
      setFields((prev) => [...prev, ...keys]);
    }
    setAddOpen(false);
  };

  const handleAddModalClose = () => {
    setAddOpen(false);
    setEditState(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    setFields((prev) =>
      arrayMoveImmutable(prev, result.source.index, result.destination!.index)
    );
  };

  return (
    <>
      <div
        className="flex cursor-pointer items-center"
        onClick={() => setManageOpen(true)}
      >
        <Icon element={CgOptions} size={20} style={{ color: colors.$3 }} />
      </div>

      <Modal
        title={t('settings')}
        visible={manageOpen}
        onClose={() => setManageOpen(false)}
        disableClosing={addOpen}
      >
        <div className="flex flex-col space-y-4">
          {fields.length === 0 && (
            <span className="text-center font-medium text-gray-500">
              {t('no_records_found')}
            </span>
          )}

          {fields.length > 0 && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="dashboard-fields"
                renderClone={(provided, _, rubric) => (
                  <div
                    className="flex items-center justify-between text-sm"
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                  >
                    <FieldRow
                      decoded={decodeDashboardField(
                        fields[rubric.source.index]
                      )}
                    />
                  </div>
                )}
              >
                {(droppableProvided) => (
                  <div
                    className="flex flex-col"
                    {...droppableProvided.droppableProps}
                    ref={droppableProvided.innerRef}
                  >
                    {fields.map((key, index) => (
                      <Draggable
                        key={`${key}-${index}`}
                        draggableId={`${key}-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            className="flex items-center justify-between py-1.5"
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            <div
                              className="flex flex-1 items-center cursor-pointer"
                              {...provided.dragHandleProps}
                            >
                              <FieldRow
                                decoded={decodeDashboardField(key)}
                                onRemove={() => handleRemove(index)}
                                onEdit={() => handleEdit(index)}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          <Button
            behavior="button"
            type="secondary"
            onClick={() => setAddOpen(true)}
          >
            {t('add_field')}
          </Button>

          <Button
            behavior="button"
            onClick={handleSave}
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      </Modal>

      <AddFieldModal
        visible={addOpen}
        onClose={handleAddModalClose}
        onAdd={handleAddOrEdit}
        existingFields={fields}
        editKey={editState?.key ?? null}
        editIndex={editState?.index ?? null}
      />
    </>
  );
}
