/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Card } from '$app/components/cards';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import Toggle from '$app/components/forms/Toggle';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { RecurringInvoiceContext } from '../../create/Create';

export default function Settings() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const hasPermission = useHasPermission();

  const context: RecurringInvoiceContext = useOutletContext();
  const { recurringInvoice, errors, setRecurringInvoice } = context;

  const handleChange = (
    property: keyof RecurringInvoice,
    value: string | number | boolean
  ) => {
    setRecurringInvoice(
      (currentRecurringInvoice) =>
        currentRecurringInvoice && {
          ...currentRecurringInvoice,
          [property]: value,
        }
    );
  };

  return (
    <Card
      title={t('settings')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="flex justify-center w-full pb-10 pt-2">
        <div className="grid grid-cols-12 gap-4 px-6 w-full xl:w-2/3">
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <ProjectSelector
                inputLabel={t('project')}
                value={recurringInvoice?.project_id}
                onChange={(project) => handleChange('project_id', project.id)}
                errorMessage={errors?.errors.project_id}
              />
            </div>

            <NumberInputField
              label={t('exchange_rate')}
              value={recurringInvoice?.exchange_rate || 1.0}
              onValueChange={(value) =>
                handleChange('exchange_rate', parseFloat(value))
              }
              errorMessage={errors?.errors.exchange_rate}
              disablePrecision
            />

            <div className="space-y-2">
              <DesignSelector
                inputLabel={t('design')}
                value={recurringInvoice?.design_id}
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
                inputLabel={t('assigned_user')}
                value={recurringInvoice?.assigned_user_id}
                onChange={(user) => handleChange('assigned_user_id', user.id)}
                errorMessage={errors?.errors.assigned_user_id}
                readonly={!hasPermission('edit_recurring_invoice')}
              />
            </div>

            <div className="space-y-2">
              <VendorSelector
                inputLabel={t('vendor')}
                value={recurringInvoice?.vendor_id}
                onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                onClearButtonClick={() => handleChange('vendor_id', '')}
                errorMessage={errors?.errors.vendor_id}
              />
            </div>

            <div className="lg:pt-[1.8rem]">
              <Toggle
                label={t('inclusive_taxes')}
                checked={recurringInvoice?.uses_inclusive_taxes || false}
                onChange={(value) =>
                  handleChange('uses_inclusive_taxes', value)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
