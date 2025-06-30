/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { UserSelector } from '$app/components/users/UserSelector';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { PurchaseOrderContext } from '../../create/Create';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useColorScheme } from '$app/common/colors';
import Toggle from '$app/components/forms/Toggle';

export default function Settings() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const context: PurchaseOrderContext = useOutletContext();
  const { purchaseOrder, setPurchaseOrder, errors } = context;

  const handleChange = <T extends keyof PurchaseOrder>(
    property: T,
    value: PurchaseOrder[typeof property]
  ) => {
    setPurchaseOrder((current) => current && { ...current, [property]: value });
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
              <UserSelector
                inputLabel={t('User')}
                value={purchaseOrder?.assigned_user_id}
                onChange={(user) => handleChange('assigned_user_id', user.id)}
                errorMessage={errors?.errors.assigned_user_id}
              />
            </div>

            <div className="space-y-2">
              <ProjectSelector
                inputLabel={t('project')}
                value={purchaseOrder?.project_id}
                onChange={(project) => handleChange('project_id', project.id)}
                errorMessage={errors?.errors.project_id}
              />
            </div>

            <div className="space-y-2">
              <ClientSelector
                inputLabel={t('client')}
                value={purchaseOrder?.client_id}
                onChange={(client) => handleChange('client_id', client.id)}
                errorMessage={errors?.errors.client_id}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <NumberInputField
                label={t('exchange_rate')}
                value={purchaseOrder?.exchange_rate || 1.0}
                onValueChange={(value) =>
                  handleChange('exchange_rate', parseFloat(value) || 1.0)
                }
                errorMessage={errors?.errors.exchange_rate}
                disablePrecision
              />
            </div>

            <div className="space-y-2">
              <DesignSelector
                inputLabel={t('design')}
                value={purchaseOrder?.design_id}
                onChange={(design) => handleChange('design_id', design.id)}
                onClearButtonClick={() => handleChange('design_id', '')}
                disableWithQueryParameter
                errorMessage={errors?.errors.design_id}
              />
            </div>

            <div className="lg:pt-[1.85rem]">
              <Toggle
                label={t('inclusive_taxes')}
                checked={purchaseOrder?.uses_inclusive_taxes ?? false}
                onValueChange={(value) =>
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
