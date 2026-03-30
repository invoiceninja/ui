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
import {
  Calculate,
  CompanyUser,
  Field,
  Format,
  Period,
} from '$app/common/interfaces/company-user';
import {
  decodeDashboardField,
  encodeDashboardField,
} from '$app/common/helpers/react-settings';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { User } from '$app/common/interfaces/user';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { GridDotsVertical } from '$app/components/icons/GridDotsVertical';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { PERIOD_LABELS } from './DashboardCard';

const FIELDS: Field[] = [
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

interface NewField {
  field: Field | '';
  period: Period;
  calculate: Calculate;
  format: Format;
}

function emptyNewField(): NewField {
  return {
    field: '',
    period: 'current',
    calculate: 'sum',
    format: 'money',
  };
}

export function DashboardCardSelector() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const colors = useColorScheme();
  const currentUser = useCurrentUser();

  const [fields, setFields] = useState<string[]>([]);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [manageOpen, setManageOpen] = useState<boolean>(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [newField, setNewField] = useState<NewField>(emptyNewField());

  useEffect(() => {
    if (manageOpen && currentUser) {
      setFields(
        currentUser.company_user?.react_settings.dashboard_fields ?? []
      );
    }
  }, [manageOpen, currentUser]);

  const handleSave = () => {
    const updated = cloneDeep(currentUser) as User;

    if (!updated || isFormBusy) return;

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

  const handleAddField = () => {
    if (!newField.field) return;

    const existingCount = fields.filter((k) => {
      const d = decodeDashboardField(k);
      return (
        d.field === newField.field &&
        d.period === newField.period &&
        d.calculate === newField.calculate &&
        d.format === newField.format
      );
    }).length;

    const key = encodeDashboardField(
      newField.field as Field,
      newField.period,
      newField.calculate,
      newField.format,
      existingCount
    );

    setFields((prev) => [...prev, key]);
    setNewField(emptyNewField());
    setAddOpen(false);
  };

  const handleRemove = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

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
                renderClone={(provided, _, rubric) => {
                  const decoded = decodeDashboardField(
                    fields[rubric.source.index]
                  );
                  return (
                    <div
                      className="flex items-center justify-between text-sm"
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <div className="flex items-center space-x-2">
                        <GridDotsVertical size="1.2rem" color={colors.$17} />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {t(FIELDS_LABELS[decoded.field] ?? decoded.field)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {t(PERIOD_LABELS[decoded.period] ?? decoded.period)}
                            {' · '}
                            {t(
                              decoded.calculate === 'avg'
                                ? 'average'
                                : decoded.calculate
                            )}
                          </span>
                        </div>
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
                {(droppableProvided) => (
                  <div
                    className="flex flex-col"
                    {...droppableProvided.droppableProps}
                    ref={droppableProvided.innerRef}
                  >
                    {fields.map((key, index) => {
                      const decoded = decodeDashboardField(key);
                      return (
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
                                className="flex flex-1 items-center space-x-2 cursor-pointer"
                                {...provided.dragHandleProps}
                              >
                                <GridDotsVertical
                                  size="1.2rem"
                                  color={colors.$17}
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {t(
                                      FIELDS_LABELS[decoded.field] ??
                                        decoded.field
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {t(
                                      PERIOD_LABELS[decoded.period] ??
                                        decoded.period
                                    )}
                                    {' · '}
                                    {t(
                                      decoded.calculate === 'avg'
                                        ? 'average'
                                        : decoded.calculate
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div
                                className="cursor-pointer"
                                onClick={() => handleRemove(index)}
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
                      );
                    })}

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

      <Modal
        title={t('add_field')}
        size="extraSmall"
        visible={addOpen}
        onClose={() => {
          setAddOpen(false);
          setNewField(emptyNewField());
        }}
      >
        <div className="flex flex-col space-y-4">
          <SelectField
            label={t('field')}
            value={newField.field}
            onValueChange={(v) =>
              setNewField((prev) => ({ ...prev, field: v as Field }))
            }
            withBlank
          >
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {t(FIELDS_LABELS[f])}
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t('period')}
            value={newField.period}
            onValueChange={(v) =>
              setNewField((prev) => ({ ...prev, period: v as Period }))
            }
          >
            <option value="current">{t('current_period')}</option>
            <option value="previous">{t('previous_period')}</option>
            <option value="total">{t('total')}</option>
          </SelectField>

          <SelectField
            label={t('calculate')}
            value={newField.calculate}
            onValueChange={(v) =>
              setNewField((prev) => ({ ...prev, calculate: v as Calculate }))
            }
          >
            <option value="sum">{t('sum')}</option>
            <option value="avg">{t('average')}</option>
            <option value="count">{t('count')}</option>
          </SelectField>

          {newField.field.endsWith('tasks') && (
            <SelectField
              label={t('format')}
              value={newField.format}
              onValueChange={(v) =>
                setNewField((prev) => ({ ...prev, format: v as Format }))
              }
            >
              <option value="money">{t('money')}</option>
              <option value="time">{t('time')}</option>
            </SelectField>
          )}

          <Button
            behavior="button"
            onClick={handleAddField}
            disabled={!newField.field}
            disableWithoutIcon
          >
            {t('add')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
