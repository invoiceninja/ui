/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { MdClose, MdDragIndicator } from 'react-icons/md';
import { IoWarning } from 'react-icons/io5';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  decodeDashboardField,
  encodeDashboardField,
} from '$app/common/helpers/react-settings';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { resetChanges, updateUser } from '$app/common/stores/slices/user';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Button, InputField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import {
  Calculate,
  Field,
  Format,
  Period,
} from '$app/common/interfaces/company-user';

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

const PERIOD_OPTIONS: { value: Period; labelKey: string }[] = [
  { value: 'current', labelKey: 'current_period' },
  { value: 'previous', labelKey: 'previous_period' },
  { value: 'total', labelKey: 'total' },
];

const CALCULATE_OPTIONS: { value: Calculate; labelKey: string }[] = [
  { value: 'sum', labelKey: 'sum' },
  { value: 'avg', labelKey: 'average' },
  { value: 'count', labelKey: 'count' },
];

interface ToggleOption {
  value: string;
  labelKey: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ToggleGroup({
  options,
  value,
  onChange,
  disabled = false,
}: ToggleGroupProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div
      className="flex rounded-lg overflow-hidden border w-full"
      style={{
        borderColor: colors.$24,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {options.map((option, index) => (
        <div
          key={option.value}
          className="flex flex-1 items-center justify-center px-2 py-1.5 cursor-pointer text-xs font-medium select-none"
          onClick={() => onChange(option.value)}
          style={{
            backgroundColor: value === option.value ? colors.$3 : colors.$1,
            color: value === option.value ? colors.$1 : colors.$3,
            borderLeft: index > 0 ? `1px solid ${colors.$24}` : undefined,
          }}
        >
          {t(option.labelKey)}
        </div>
      ))}
    </div>
  );
}

interface DragItemProps {
  decoded: ReturnType<typeof decodeDashboardField>;
  onRemove?: () => void;
}

function DragItem({ decoded, onRemove }: DragItemProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <>
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <Icon
          element={MdDragIndicator}
          size={16}
          style={{ color: colors.$17 }}
        />

        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-medium truncate"
            style={{ color: colors.$3 }}
          >
            {t(FIELDS_LABELS[decoded.field] ?? decoded.field)}
          </span>

          <span className="text-xs truncate" style={{ color: colors.$17 }}>
            {t(
              decoded.period === 'current'
                ? 'current_period'
                : decoded.period === 'previous'
                ? 'previous_period'
                : 'total'
            )}
            {' · '}
            {t(decoded.calculate === 'avg' ? 'average' : decoded.calculate)}
          </span>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          className="p-1 rounded-md shrink-0"
          onClick={onRemove}
        >
          <Icon element={MdClose} size={16} style={{ color: colors.$17 }} />
        </button>
      )}
    </>
  );
}

export function DashboardCardSelector() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const colors = useColorScheme();
  const currentUser = useCurrentUser();

  const [fields, setFields] = useState<string[]>([]);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [manageOpen, setManageOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedField, setSelectedField] = useState<Field | ''>('');
  const [period, setPeriod] = useState<Period>('current');
  const [calculate, setCalculate] = useState<Calculate>('sum');
  const [format, setFormat] = useState<Format>('money');

  useEffect(() => {
    if (manageOpen && currentUser) {
      setFields(
        currentUser.company_user?.react_settings.dashboard_fields ?? []
      );

      setSearchQuery('');
      setSelectedField('');
      setPeriod('current');
      setCalculate('sum');
      setFormat('money');
    }
  }, [manageOpen, currentUser]);

  const filteredFields = useMemo(
    () =>
      FIELDS.filter((f) =>
        t(FIELDS_LABELS[f]).toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, t]
  );

  const isDuplicate = useMemo(
    () =>
      selectedField
        ? fields.some((key) => {
            const d = decodeDashboardField(key);

            return (
              d.field === selectedField &&
              d.period === period &&
              d.calculate === calculate &&
              d.format === format
            );
          })
        : false,
    [selectedField, fields, period, calculate, format]
  );

  const isTaskField = useMemo(
    () => selectedField.endsWith('tasks'),
    [selectedField]
  );

  const handleSave = useCallback(() => {
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
  }, [currentUser, isFormBusy, fields, dispatch]);

  const handleAdd = useCallback(() => {
    if (!selectedField || isDuplicate) {
      return;
    }

    const existingCount = fields.filter((k) => {
      const d = decodeDashboardField(k);

      return (
        d.field === selectedField &&
        d.period === period &&
        d.calculate === calculate &&
        d.format === format
      );
    }).length;

    const key = encodeDashboardField(
      selectedField as Field,
      period,
      calculate,
      isTaskField ? format : 'money',
      existingCount
    );

    setFields((prev) => [...prev, key]);
    setSelectedField('');
  }, [
    selectedField,
    isDuplicate,
    fields,
    period,
    calculate,
    format,
    isTaskField,
  ]);

  const handleRemove = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    setFields((prev) =>
      arrayMoveImmutable(prev, result.source.index, result.destination!.index)
    );
  }, []);

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
        size="large"
      >
        <div
          className="flex flex-col lg:flex-row"
          style={{ minHeight: '28rem' }}
        >
          <div className="flex flex-col lg:w-1/3 lg:pr-5 pb-4 lg:pb-0">
            <span
              className="text-sm font-semibold mb-3"
              style={{ color: colors.$3 }}
            >
              {t('current')} {t('cards')}
            </span>

            <div
              className="flex-1 overflow-y-auto rounded-md p-2"
              style={{
                maxHeight: '24rem',
              }}
            >
              {fields.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <span className="text-sm" style={{ color: colors.$17 }}>
                    {t('no_records_found')}
                  </span>
                </div>
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
                          className="flex items-center justify-between rounded-md px-2 py-2 bg-gray-100"
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <DragItem decoded={decoded} onRemove={() => {}} />
                        </div>
                      );
                    }}
                  >
                    {(droppableProvided) => (
                      <div
                        className="flex flex-col space-y-2.5"
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
                                  className="flex items-center justify-between rounded-md px-2 py-2 bg-gray-100"
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                >
                                  <div
                                    className="flex items-center space-x-2 min-w-0 flex-1 cursor-grab"
                                    {...provided.dragHandleProps}
                                  >
                                    <DragItem
                                      decoded={decoded}
                                      onRemove={() => handleRemove(index)}
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
            </div>
          </div>

          <div
            className="hidden lg:block"
            style={{
              width: '1px',
              backgroundColor: colors.$21,
              flexShrink: 0,
            }}
          />

          <div className="flex flex-col lg:w-2/3 lg:pl-5 pt-4 lg:pt-0">
            <span
              className="text-sm font-semibold mb-3"
              style={{ color: colors.$3 }}
            >
              {t('add_field')}
            </span>

            <div className="flex flex-col lg:flex-row lg:space-x-4 flex-1">
              <div className="flex flex-col lg:w-1/2">
                <InputField
                  placeholder={t('search')}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  changeOverride
                  debounceTimeout={0}
                  clearable
                />

                <div
                  className="flex flex-col mt-2 overflow-y-auto rounded-md border"
                  style={{
                    borderColor: colors.$24,
                    height: '20rem',
                  }}
                >
                  {filteredFields.map((f) => (
                    <div
                      key={f}
                      className="flex items-center px-3 py-2 cursor-pointer text-sm shrink-0"
                      onClick={() => setSelectedField(f)}
                      style={{
                        backgroundColor:
                          selectedField === f ? colors.$25 : 'transparent',
                        color: colors.$3,
                      }}
                    >
                      {t(FIELDS_LABELS[f])}
                    </div>
                  ))}

                  {filteredFields.length === 0 && (
                    <div className="flex items-center justify-center flex-1">
                      <span className="text-xs" style={{ color: colors.$17 }}>
                        {t('no_records_found')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col lg:w-1/2 pt-4 lg:pt-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: colors.$22,
                        opacity: selectedField ? 1 : 0.4,
                      }}
                    >
                      {t('period')}
                    </span>

                    <ToggleGroup
                      options={PERIOD_OPTIONS}
                      value={period}
                      onChange={(value) => setPeriod(value as Period)}
                      disabled={!selectedField}
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: colors.$22,
                        opacity: selectedField ? 1 : 0.4,
                      }}
                    >
                      {t('calculate')}
                    </span>

                    <ToggleGroup
                      options={CALCULATE_OPTIONS}
                      value={calculate}
                      onChange={(value) => setCalculate(value as Calculate)}
                      disabled={!selectedField}
                    />
                  </div>

                  {isTaskField && (
                    <div className="flex flex-col space-y-1.5">
                      <span
                        className="text-xs font-medium"
                        style={{ color: colors.$22 }}
                      >
                        {t('format')}
                      </span>

                      <ToggleGroup
                        options={[
                          { value: 'money', labelKey: 'money' },
                          { value: 'time', labelKey: 'time' },
                        ]}
                        value={format}
                        onChange={(value) => setFormat(value as Format)}
                      />
                    </div>
                  )}

                  <div className="flex flex-col space-y-1.5 w-full">
                    <div
                      className="flex flex-col items-center justify-center rounded-md border px-4 py-3"
                      style={{
                        borderColor: colors.$24,
                        opacity: selectedField ? 1 : 0.4,
                      }}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {selectedField
                          ? t(FIELDS_LABELS[selectedField] ?? selectedField)
                          : t('field')}
                      </span>

                      <span
                        className="text-xl font-semibold mt-0.5"
                        style={{ color: colors.$3 }}
                      >
                        {calculate === 'count' ? '0' : '0.00'}
                      </span>

                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium mt-1"
                        style={{
                          backgroundColor:
                            colors.$0 === 'dark' ? colors.$25 : colors.$23,
                          color: colors.$17,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: '#5DCAA5' }}
                        />
                        {t(
                          period === 'current'
                            ? 'current_period'
                            : period === 'previous'
                            ? 'previous_period'
                            : 'total'
                        )}
                        {' · '}
                        {t(calculate === 'avg' ? 'average' : calculate)}
                      </span>
                    </div>

                    {isDuplicate && (
                      <div className="flex items-center space-x-2">
                        <Icon
                          element={IoWarning}
                          size={16}
                          style={{ color: '#EAB308' }}
                        />

                        <span className="text-xs" style={{ color: colors.$17 }}>
                          {t('card_already_exists')}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isDuplicate && (
                    <div className="flex justify-end">
                      <Button
                        behavior="button"
                        type="secondary"
                        onClick={handleAdd}
                        disabled={!selectedField}
                        disableWithoutIcon={!selectedField}
                      >
                        {t('add')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <Button
            className="w-full lg:w-auto"
            behavior="button"
            onClick={handleSave}
            disabled={isFormBusy}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
