/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import Toggle from '$app/components/forms/Toggle';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { useOutletContext } from 'react-router-dom';
import { Context } from '../Edit';
import { useTranslation } from 'react-i18next';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Invoice } from '$app/common/interfaces/invoice';
import { Card } from '$app/components/cards';
import { NumberInputField } from '$app/components/forms/NumberInputField';

export default function Settings() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const context: Context = useOutletContext();

  const { invoice, errors, setInvoice } = context;

  const handleChange = (
    property: keyof Invoice,
    value: string | number | boolean
  ) => {
    setInvoice(
      (currentInvoice) =>
        currentInvoice && { ...currentInvoice, [property]: value }
    );
  };

  return (
    <Card title={t('settings')} className="w-full xl:w-2/3">
      <div className="grid grid-cols-12 gap-4 px-6">
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <ProjectSelector
              inputLabel={t('project')}
              value={invoice?.project_id}
              onChange={(project) => handleChange('project_id', project.id)}
              errorMessage={errors?.errors.project_id}
              onClearButtonClick={() => handleChange('project_id', '')}
            />
          </div>

          <NumberInputField
            label={t('exchange_rate')}
            value={invoice?.exchange_rate || 1.0}
            onValueChange={(value) =>
              handleChange('exchange_rate', parseFloat(value) || 1.0)
            }
            errorMessage={errors?.errors.exchange_rate}
            disablePrecision
          />

          <Toggle
            label={t('auto_bill_enabled')}
            checked={invoice?.auto_bill_enabled || false}
            onChange={(value) => handleChange('auto_bill_enabled', value)}
          />

          <div className="space-y-2">
            <DesignSelector
              inputLabel={t('design')}
              value={invoice?.design_id}
              onChange={(design) => handleChange('design_id', design.id)}
              onClearButtonClick={() => handleChange('design_id', '')}
              disableWithQueryParameter
              errorMessage={errors?.errors.design_id}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <UserSelector
              inputLabel={t('user')}
              value={invoice?.assigned_user_id}
              onChange={(user) => handleChange('assigned_user_id', user.id)}
              errorMessage={errors?.errors.assigned_user_id}
              readonly={!hasPermission('edit_invoice')}
            />
          </div>

          <div className="space-y-2">
            <VendorSelector
              inputLabel={t('vendor')}
              value={invoice?.vendor_id}
              onChange={(vendor) => handleChange('vendor_id', vendor.id)}
              onClearButtonClick={() => handleChange('vendor_id', '')}
              errorMessage={errors?.errors.vendor_id}
            />
          </div>

          <Toggle
            label={t('inclusive_taxes')}
            checked={invoice?.uses_inclusive_taxes || false}
            onChange={(value) => handleChange('uses_inclusive_taxes', value)}
          />
        </div>
      </div>
    </Card>
  );
}
