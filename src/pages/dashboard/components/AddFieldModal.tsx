/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef, useState } from 'react';
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
import { Divider } from '$app/components/cards/Divider';
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

interface PendingField {
  field: Field;
  period: Period;
  calculate: Calculate;
  format: Format;
}

function defaultPending(field: Field): PendingField {
  return { field, period: 'current', calculate: 'sum', format: 'money' };
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

interface FieldButtonProps {
  field: Field;
  onClick: () => void;
}

function FieldButton({ field, onClick }: FieldButtonProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
      style={{
        backgroundColor: hovered ? colors.$5 : 'transparent',
        color: colors.$3,
      }}
    >
      {t(FIELDS_LABELS[field])}
    </button>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (keys: string[]) => void;
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

  const isEditMode = editKey !== null;

  const rightPanelRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState<string>('');
  const [pending, setPending] = useState<PendingField[]>([]);

  useEffect(() => {
    if (visible) {
      setSearch('');
      if (isEditMode && editKey) {
        const decoded = decodeDashboardField(editKey);
        setPending([
          {
            field: decoded.field,
            period: decoded.period,
            calculate: decoded.calculate,
            format: decoded.format,
          },
        ]);
      } else {
        setPending([]);
      }
    }
  }, [visible, editKey]);

  useEffect(() => {
    if (rightPanelRef.current && pending.length > 0) {
      rightPanelRef.current.scrollTo({
        top: rightPanelRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [pending.length]);

  const handleFieldClick = (field: Field) => {
    if (isEditMode) {
      return;
    }

    setPending((prev) => [...prev, defaultPending(field)]);
  };

  const handleRemovePending = (index: number) => {
    setPending((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePending = (index: number, patch: Partial<PendingField>) => {
    setPending((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  };

  const handleConfirm = () => {
    const keys = pending.map((p, i) => {
      const existingCount = existingFields.filter((k, ei) => {
        if (isEditMode && editIndex !== null && ei === editIndex) return false;
        const d = decodeDashboardField(k);
        return (
          d.field === p.field &&
          d.period === p.period &&
          d.calculate === p.calculate &&
          d.format === p.format
        );
      }).length;

      const dupeInPending = pending
        .slice(0, i)
        .filter(
          (pp) =>
            pp.field === p.field &&
            pp.period === p.period &&
            pp.calculate === p.calculate &&
            pp.format === p.format
        ).length;

      return encodeDashboardField(
        p.field,
        p.period,
        p.calculate,
        p.format,
        existingCount + dupeInPending
      );
    });

    onAdd(keys);
    setPending([]);
    setSearch('');
  };

  const handleClose = () => {
    setPending([]);
    setSearch('');
    onClose();
  };

  const getPreviewValue = (p: PendingField) => {
    if (p.calculate === 'count') {
      return String(MOCK_COUNT_VALUES[p.field] ?? 10);
    }
    if (p.format === 'time') {
      return '08:30';
    }
    const raw =
      p.calculate === 'avg'
        ? Math.round(
            (MOCK_MONEY_VALUES[p.field] ?? 1000) /
              (MOCK_COUNT_VALUES[p.field] ?? 10)
          )
        : MOCK_MONEY_VALUES[p.field] ?? 1000;

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
      title={isEditMode ? t('edit_field') : t('add_field')}
      size="large"
      visible={visible}
      onClose={handleClose}
    >
      <div className="flex gap-6" style={{ minHeight: '420px' }}>
        {!isEditMode && (
          <>
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
                style={{ maxHeight: '360px' }}
              >
                {filteredFields.map((f) => (
                  <FieldButton
                    key={f}
                    field={f}
                    onClick={() => handleFieldClick(f)}
                  />
                ))}
              </div>
            </div>

            <div
              className="w-px flex-shrink-0"
              style={{ backgroundColor: colors.$24 }}
            />
          </>
        )}

        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div
            ref={rightPanelRef}
            className="flex flex-col overflow-y-auto"
            style={{ maxHeight: '360px' }}
          >
            {pending.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400 py-8">
                {t('select_a_field')}
              </div>
            )}

            {pending.map((p, index) => (
              <div key={index}>
                {index > 0 && (
                  <Divider
                    className="border-dashed"
                    withoutPadding
                    borderColor={colors.$20}
                  />
                )}

                <div className="flex flex-col space-y-3 py-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.$3 }}
                    >
                      {t(FIELDS_LABELS[p.field])}
                    </span>

                    {!isEditMode && (
                      <button
                        type="button"
                        onClick={() => handleRemovePending(index)}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {t('remove')}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-gray-500">{t('period')}</span>
                    <ToggleGroup
                      options={periodOptions}
                      value={p.period}
                      onChange={(v) =>
                        updatePending(index, { period: v as Period })
                      }
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-gray-500">
                      {t('calculate')}
                    </span>
                    <ToggleGroup
                      options={calcOptions}
                      value={p.calculate}
                      onChange={(v) =>
                        updatePending(index, { calculate: v as Calculate })
                      }
                    />
                  </div>

                  {p.field.endsWith('tasks') && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-500">
                        {t('format')}
                      </span>
                      <ToggleGroup
                        options={formatOptions}
                        value={p.format}
                        onChange={(v) =>
                          updatePending(index, { format: v as Format })
                        }
                      />
                    </div>
                  )}

                  <div
                    className="rounded-lg border flex flex-col items-center justify-center gap-1 py-4"
                    style={{
                      borderColor: colors.$24,
                      backgroundColor: colors.$4,
                    }}
                  >
                    <span className="text-xs font-medium text-gray-500">
                      {t(FIELDS_LABELS[p.field])}
                    </span>
                    <span
                      className="text-xl font-semibold"
                      style={{ color: colors.$3 }}
                    >
                      {getPreviewValue(p)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {t(PERIOD_LABELS[p.period])}
                      {' · '}
                      {t(p.calculate === 'avg' ? 'average' : p.calculate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              behavior="button"
              onClick={handleConfirm}
              disabled={pending.length === 0}
              disableWithoutIcon
            >
              {isEditMode ? t('save') : t('add')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
