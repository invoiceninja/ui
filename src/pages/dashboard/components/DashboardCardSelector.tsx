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
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  Calculate,
  CompanyUser,
  DashboardField,
  Field,
  Format,
  Period,
} from '$app/common/interfaces/company-user';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { User } from '$app/common/interfaces/user';
import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { arrayMoveImmutable } from 'array-move';
import { cloneDeep, isEqual, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CgOptions } from 'react-icons/cg';
import { MdClose, MdDragHandle } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { updateUser } from '$app/common/stores/slices/user';
import { PERIOD_LABELS } from './DashboardCard';

const FIELDS = [
  'active_invoices',
  'outstanding_invoices',
  'completed_payments',
  'refunded_payments',
  'active_quotes',
  'unapproved_quotes',
  'logged_tasks',
  'invoiced_tasks',
  'paid_tasks',
  'logged_expenses',
  'pending_expenses',
  'invoiced_expenses',
  'invoice_paid_expenses',
];

export const FIELDS_LABELS = {
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

export function DashboardCardSelector() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const currentUser = useCurrentUser();

  const [currentFields, setCurrentFields] = useState<DashboardField[]>([]);
  const [currentField, setCurrentField] = useState<DashboardField>({
    field: '' as Field,
    period: 'current',
    calculate: 'sum',
    format: 'money',
  });

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState<boolean>(false);
  const [isFieldsModalOpen, setIsFieldsModalOpen] = useState<boolean>(false);

  const handleCardsModalClose = () => {
    setIsCardsModalOpen(false);
  };

  const handleFieldsModalClose = () => {
    setIsFieldsModalOpen(false);

    setCurrentField({
      field: '' as Field,
      period: 'current',
      calculate: 'sum',
      format: 'money',
    });
  };

  const onDragEnd = (result: DropResult) => {
    const sorted = arrayMoveImmutable(
      currentFields,
      result.source.index,
      result.destination?.index as unknown as number
    );

    setCurrentFields(sorted);
  };

  const handleDelete = (field: DashboardField) => {
    const updatedCurrentColumns = currentFields.filter(
      (currentField) => !isEqual(currentField, field)
    );

    setCurrentFields(updatedCurrentColumns);
  };

  const handleSaveCards = () => {
    const updatedUser = cloneDeep(currentUser) as User;

    if (updatedUser && !isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      set(updatedUser, 'company_user.settings.dashboard_fields', currentFields);

      request(
        'PUT',
        endpoint('/api/v1/company_users/:id', { id: updatedUser.id }),
        updatedUser
      )
        .then((response: GenericSingleResourceResponse<CompanyUser>) => {
          toast.success('updated_settings');

          set(updatedUser, 'company_user', response.data.data);

          $refetch(['company_users']);

          dispatch(updateUser(updatedUser));

          handleCardsModalClose();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (currentUser && Object.keys(currentUser).length && isCardsModalOpen) {
      setCurrentFields(
        currentUser.company_user?.settings.dashboard_fields ?? []
      );
    }
  }, [currentUser, isCardsModalOpen]);

  return (
    <>
      <div
        className="flex h-full items-center cursor-pointer"
        onClick={() => setIsCardsModalOpen(true)}
      >
        <Icon element={CgOptions} size={28} />
      </div>

      <Modal
        title={t('settings')}
        visible={isCardsModalOpen}
        onClose={handleCardsModalClose}
        disableClosing={isFieldsModalOpen}
      >
        <div className="flex flex-col space-y-4">
          {!currentFields.length && (
            <span className="text-center font-medium">
              {t('no_records_found')}
            </span>
          )}

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="columns"
              renderClone={(provided, _, rubric) => {
                const dashboardField = currentFields[rubric.source.index];

                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <div className="flex space-x-2 items-center">
                      <Icon element={MdClose} size={24} />

                      <div className="flex flex-col">
                        <p>{t(FIELDS_LABELS[dashboardField.field])}</p>

                        <div className="flex text-xs space-x-1">
                          <span>
                            {t(
                              PERIOD_LABELS[
                                dashboardField.period as keyof typeof PERIOD_LABELS
                              ] ?? dashboardField.period
                            )}
                          </span>
                          <span>&middot;</span>
                          <span>
                            {t(
                              dashboardField.calculate === 'avg'
                                ? 'average'
                                : dashboardField.calculate
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div {...provided.dragHandleProps}>
                      <Icon element={MdDragHandle} size={27} />
                    </div>
                  </div>
                );
              }}
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {currentFields.map((field, index) => (
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
                              size={24}
                              onClick={() => handleDelete(field)}
                            />

                            <div className="flex flex-col">
                              <p>{t(FIELDS_LABELS[field.field])}</p>

                              <div className="flex text-xs space-x-1">
                                <span>
                                  {t(
                                    PERIOD_LABELS[
                                      field.period as keyof typeof PERIOD_LABELS
                                    ] ?? field.period
                                  )}
                                </span>
                                <span>&middot;</span>
                                <span>
                                  {t(
                                    field.calculate === 'avg'
                                      ? 'average'
                                      : field.calculate
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div {...provided.dragHandleProps}>
                            <Icon element={MdDragHandle} size={27} />
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

          <Button
            behavior="button"
            type="secondary"
            onClick={() => setIsFieldsModalOpen(true)}
          >
            {t('add_field')}
          </Button>

          <Button
            behavior="button"
            onClick={handleSaveCards}
            disableWithoutIcon
            disabled={isFormBusy}
          >
            {t('save')}
          </Button>
        </div>
      </Modal>

      <Modal
        title={t('add_field')}
        size="extraSmall"
        visible={isFieldsModalOpen}
        onClose={handleFieldsModalClose}
      >
        <div className="flex flex-col space-y-4">
          <SelectField
            label={t('field')}
            value={currentField.field}
            onValueChange={(value) =>
              setCurrentField((currentField) => ({
                ...currentField,
                field: value as Field,
              }))
            }
            withBlank
          >
            {FIELDS.map((field) => (
              <option key={field} value={field}>
                {t(FIELDS_LABELS[field as keyof typeof FIELDS_LABELS])}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t('period')}
            value={currentField.period}
            onValueChange={(value) =>
              setCurrentField((currentField) => ({
                ...currentField,
                period: value as Period,
              }))
            }
          >
            <option value="current">{t('current_period')}</option>
            <option value="previous">{t('previous_period')}</option>
            <option value="total">{t('total')}</option>
          </SelectField>

          <SelectField
            label={t('calculate')}
            value={currentField.calculate}
            onValueChange={(value) =>
              setCurrentField((currentField) => ({
                ...currentField,
                calculate: value as Calculate,
              }))
            }
          >
            <option value="sum">{t('sum')}</option>
            <option value="avg">{t('average')}</option>
            <option value="count">{t('count')}</option>
          </SelectField>

          {currentField.field.endsWith('tasks') && (
            <SelectField
              label={t('format')}
              value={currentField.format}
              onValueChange={(value) =>
                setCurrentField((currentField) => ({
                  ...currentField,
                  format: value as Format,
                }))
              }
            >
              <option value="money">{t('money')}</option>
              <option value="time">{t('time')}</option>
            </SelectField>
          )}

          <Button
            behavior="button"
            onClick={() => {
              setCurrentFields((current) => [...current, currentField]);
              handleFieldsModalClose();
            }}
            disabled={!currentField.field}
            disableWithoutIcon
          >
            {t('add')}
          </Button>
        </div>
      </Modal>
    </>
  );
}