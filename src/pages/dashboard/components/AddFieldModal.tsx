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
import {
  Calculate,
  Field,
  Format,
  Period,
} from '$app/common/interfaces/company-user';
import {
  decodeDashboardField,
  encodeDashboardField,
} from '$app/common/helpers/react-settings';
import { useColorScheme } from '$app/common/colors';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { FIELDS_LABELS } from './DashboardCardSelector';
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

const MOCK_MONEY_VALUES: Partial<Record<Field, number>> = {
  active_invoices: 14500,
  outstanding_invoices: 3200,
  completed_payments: 9800,
  refunded_payments: 450,
  active_quotes: 6700,
  unapproved_quotes: 1200,
  logged_tasks: 80,
  invoiced_tasks: 60,
  paid_tasks: 55,
  logged_expenses: 2300,
  pending_expenses: 870,
  invoiced_expenses: 1500,
  invoice_paid_expenses: 1100,
};

const MOCK_COUNT_VALUES: Partial<Record<Field, number>> = {
  active_invoices: 24,
  outstanding_invoices: 8,
  completed_payments: 41,
  refunded_payments: 3,
  active_quotes: 12,
  unapproved_quotes: 5,
  logged_tasks: 18,
  invoiced_tasks: 14,
  paid_tasks: 11,
  logged_expenses: 9,
  pending_expenses: 4,
  invoiced_expenses: 7,
  invoice_paid_expenses: 6,
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

interface ToggleGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  const colors = useColorScheme();

  return (
    <div
      className="flex rounded-lg overflow-hidden border"
      style={{ borderColor: colors.$24 }}
    >
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 px-3 py-1.5 text-sm transition-colors"
          style={{
            backgroundColor: value === opt.value ? colors.$3 : colors.$1,
            color: value === opt.value ? colors.$1 : colors.$3,
            borderLeft: i > 0 ? `1px solid ${colors.$24}` : undefined,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (key: string) => void;
  existingFields: string[];
  editKey: string | null;
  editIndex: number | null;
}

export function AddFieldModal({
  visible,
  onClose,
  onAdd,
  existingFields,
  editKey,
  editIndex,
}: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();

  const [search, setSearch] = useState<string>('');
  const [newField, setNewField] = useState<NewField>(emptyNewField());

  useEffect(() => {
    if (visible) {
      if (editKey) {
        const decoded = decodeDashboardField(editKey);
        setNewField({
          field: decoded.field,
          period: decoded.period,
          calculate: decoded.calculate,
          format: decoded.format,
        });
      } else {
        setNewField(emptyNewField());
      }
      setSearch('');
    }
  }, [visible, editKey]);

  const handleAdd = () => {
    if (!newField.field) return;

    const existingCount = existingFields.filter((k, i) => {
      if (editIndex !== null && i === editIndex) return false;
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

    onAdd(key);
    setNewField(emptyNewField());
    setSearch('');
  };

  const handleClose = () => {
    setNewField(emptyNewField());
    setSearch('');
    onClose();
  };

  const getPreviewValue = () => {
    if (!newField.field) return '—';

    const field = newField.field as Field;

    if (newField.calculate === 'count') {
      return String(MOCK_COUNT_VALUES[field] ?? 10);
    }

    if (newField.format === 'time') {
      return '08:30';
    }

    const raw =
      newField.calculate === 'avg'
        ? Math.round(
            (MOCK_MONEY_VALUES[field] ?? 1000) /
              (MOCK_COUNT_VALUES[field] ?? 10)
          )
        : MOCK_MONEY_VALUES[field] ?? 1000;

    return formatMoney(
      raw,
      company?.settings.country_id,
      company?.settings.currency_id
    );
  };

  const filteredFields = FIELDS.filter((f) =>
    t(FIELDS_LABELS[f]).toLowerCase().includes(search.toLowerCase())
  );

  const periodOptions = [
    { value: 'current', label: t('current_period') },
    { value: 'previous', label: t('previous_period') },
    { value: 'total', label: t('total') },
  ];

  const calcOptions = [
    { value: 'sum', label: t('sum') },
    { value: 'avg', label: t('average') },
    { value: 'count', label: t('count') },
  ];

  const formatOptions = [
    { value: 'money', label: t('money') },
    { value: 'time', label: t('time') },
  ];

  return (
    <Modal
      title={editKey ? t('edit_field') : t('add_field')}
      size="large"
      visible={visible}
      onClose={handleClose}
    >
      <div className="flex gap-6" style={{ minHeight: '380px' }}>
        <div className="flex flex-col w-52 flex-shrink-0 space-y-2">
          <input
            type="text"
            placeholder={`${t('search')}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none"
            style={{
              borderColor: colors.$24,
              backgroundColor: colors.$1,
              color: colors.$3,
            }}
          />

          <div
            className="flex flex-col space-y-0.5 overflow-y-auto"
            style={{ maxHeight: '320px' }}
          >
            {filteredFields.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setNewField((prev) => ({ ...prev, field: f }))}
                className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  backgroundColor:
                    newField.field === f ? colors.$5 : 'transparent',
                  color: colors.$3,
                }}
              >
                {t(FIELDS_LABELS[f])}
              </button>
            ))}
          </div>
        </div>

        <div
          className="w-px flex-shrink-0"
          style={{ backgroundColor: colors.$24 }}
        />

        <div className="flex flex-1 flex-col justify-between">
          {newField.field ? (
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500">{t('period')}</span>
                <ToggleGroup
                  options={periodOptions}
                  value={newField.period}
                  onChange={(v) =>
                    setNewField((prev) => ({ ...prev, period: v as Period }))
                  }
                />
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs text-gray-500">{t('calculate')}</span>
                <ToggleGroup
                  options={calcOptions}
                  value={newField.calculate}
                  onChange={(v) =>
                    setNewField((prev) => ({
                      ...prev,
                      calculate: v as Calculate,
                    }))
                  }
                />
              </div>

              {(newField.field as string).endsWith('tasks') && (
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-gray-500">{t('format')}</span>
                  <ToggleGroup
                    options={formatOptions}
                    value={newField.format}
                    onChange={(v) =>
                      setNewField((prev) => ({ ...prev, format: v as Format }))
                    }
                  />
                </div>
              )}

              <div
                className="rounded-lg border flex flex-col items-center justify-center gap-1 py-6"
                style={{
                  borderColor: colors.$24,
                  backgroundColor: colors.$4,
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {t(FIELDS_LABELS[newField.field as Field])}
                </span>
                <span
                  className="text-2xl font-semibold"
                  style={{ color: colors.$3 }}
                >
                  {getPreviewValue()}
                </span>
                <span className="text-xs text-gray-400">
                  {t(PERIOD_LABELS[newField.period])}
                  {' · '}
                  {t(
                    newField.calculate === 'avg'
                      ? 'average'
                      : newField.calculate
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              {t('select_a_field')}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button behavior="button" type="secondary" onClick={handleClose}>
              {t('cancel')}
            </Button>

            <Button
              behavior="button"
              onClick={handleAdd}
              disabled={!newField.field}
              disableWithoutIcon
            >
              {editKey ? t('save') : t('add')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
