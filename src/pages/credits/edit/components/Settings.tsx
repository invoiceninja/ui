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
import { CreditsContext } from '../../create/Create';
import { useCreditUtilities } from '../../common/hooks';
import { UserSelector } from '$app/components/users/UserSelector';
import { VendorSelector } from '$app/components/vendors/VendorSelector';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import Toggle from '$app/components/forms/Toggle';
import { Card } from '$app/components/cards';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { useColorScheme } from '$app/common/colors';

export default function Settings() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const context: CreditsContext = useOutletContext();
  const { credit, errors, client } = context;

  const hasPermission = useHasPermission();

  const { handleChange } = useCreditUtilities({
    client,
  });

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
                value={credit?.project_id}
                onChange={(project) => handleChange('project_id', project.id)}
                errorMessage={errors?.errors.project_id}
                onClearButtonClick={() => handleChange('project_id', '')}
              />
            </div>

            <NumberInputField
              label={t('exchange_rate')}
              value={credit?.exchange_rate || 1.0}
              onValueChange={(value) =>
                handleChange('exchange_rate', parseFloat(value) || 1.0)
              }
              errorMessage={errors?.errors.exchange_rate}
              disablePrecision
            />

            <div className="space-y-2">
              <DesignSelector
                inputLabel={t('design')}
                value={credit?.design_id}
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
                value={credit?.assigned_user_id}
                onChange={(user) => handleChange('assigned_user_id', user.id)}
                errorMessage={errors?.errors.assigned_user_id}
                readonly={!hasPermission('edit_credit')}
              />
            </div>

            <div className="space-y-2">
              <VendorSelector
                inputLabel={t('vendor')}
                value={credit?.vendor_id}
                onChange={(vendor) => handleChange('vendor_id', vendor.id)}
                onClearButtonClick={() => handleChange('vendor_id', '')}
                errorMessage={errors?.errors.vendor_id}
              />
            </div>

            <div className="lg:pt-7">
              <Toggle
                label={t('inclusive_taxes')}
                checked={credit?.uses_inclusive_taxes || false}
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
