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
import { v4 } from 'uuid';
import { cloneDeep, set } from 'lodash';
import { CgOptions } from 'react-icons/cg';
import { MdClose } from 'react-icons/md';

import {
  Calculate,
  CompanyUser,
  DashboardCardField,
  Field,
  Format,
  Period,
} from '$app/common/interfaces/company-user';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { User } from '$app/common/interfaces/user';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { $refetch } from '$app/common/hooks/useRefetch';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { updateUser } from '$app/common/stores/slices/user';

import { Button, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
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

function emptyField(): DashboardCardField {
  return {
    id: v4(),
    field: '' as Field,
    period: 'current',
    calculate: 'sum',
    format: 'money',
  };
}

export function DashboardCardSelector() {
  const [t] = useTranslation();
  const dispatch = useDispatch();
  const currentUser = useCurrentUser();

  const [isBusy, setIsBusy] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [fields, setFields] = useState<DashboardCardField[]>([]);
  const [newField, setNewField] = useState<DashboardCardField>(emptyField());

  // Load current fields when manage modal opens
  useEffect(() => {
    if (manageOpen && currentUser) {
      setFields(
        currentUser.company_user?.react_settings.dashboard_fields ?? []
      );
    }
  }, [manageOpen, currentUser]);

  const handleSave = () => {
    const updated = cloneDeep(currentUser) as User;
    if (!updated || isBusy) return;

    toast.processing();
    setIsBusy(true);

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
        setManageOpen(false);
      })
      .finally(() => setIsBusy(false));
  };

  const handleAddField = () => {
    setFields((prev) => [...prev, { ...newField, id: v4() }]);
    setNewField(emptyField());
    setAddOpen(false);
  };

  return (
    <>
      {/* Trigger icon */}
      <div
        className="flex cursor-pointer items-center"
        onClick={() => setManageOpen(true)}
      >
        <Icon element={CgOptions} size={28} />
      </div>

      {/* ── Manage cards modal ──────────────────────────────── */}
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

          <div className="flex flex-col space-y-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center space-x-3 py-1">
                <Icon
                  className="cursor-pointer"
                  element={MdClose}
                  size={22}
                  onClick={() =>
                    setFields((prev) => prev.filter((f) => f.id !== field.id))
                  }
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {t(FIELDS_LABELS[field.field] ?? field.field)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t(PERIOD_LABELS[field.period] ?? field.period)}
                    {' · '}
                    {t(field.calculate === 'avg' ? 'average' : field.calculate)}
                  </span>
                </div>
              </div>
            ))}
          </div>

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
            disabled={isBusy}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      </Modal>

      {/* ── Add field modal ─────────────────────────────────── */}
      <Modal
        title={t('add_field')}
        size="extraSmall"
        visible={addOpen}
        onClose={() => {
          setAddOpen(false);
          setNewField(emptyField());
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
