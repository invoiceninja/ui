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
import { Button, SelectField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { FIELDS_LABELS } from './DashboardCardSelector';

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

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (key: string) => void;
  existingFields: string[];
}

export function AddFieldModal({
  visible,
  onClose,
  onAdd,
  existingFields,
}: Props) {
  const [t] = useTranslation();

  const [newField, setNewField] = useState<NewField>(emptyNewField());

  const handleAdd = () => {
    if (!newField.field) {
      return;
    }

    const existingCount = existingFields.filter((k) => {
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
  };

  const handleClose = () => {
    setNewField(emptyNewField());
    onClose();
  };

  return (
    <Modal
      title={t('add_field')}
      size="extraSmall"
      visible={visible}
      onClose={handleClose}
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
          onClick={handleAdd}
          disabled={!newField.field}
          disableWithoutIcon
        >
          {t('add')}
        </Button>
      </div>
    </Modal>
  );
}
