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
import { useTranslation } from 'react-i18next';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Card } from '$app/components/cards';
import { QuoteContext } from '../../create/Create';
import { Quote } from '$app/common/interfaces/quote';
import { NumberInputField } from '$app/components/forms/NumberInputField';

export default function Settings() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();

  const context: QuoteContext = useOutletContext();
  const { quote, errors, setQuote } = context;

  const handleChange = (
    property: keyof Quote,
    value: string | number | boolean
  ) => {
    setQuote(
      (currentQuote) => currentQuote && { ...currentQuote, [property]: value }
    );
  };

  return (
    <Card title={t('settings')} className="w-full xl:w-2/3">
      <div className="grid grid-cols-12 gap-4 px-6">
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <UserSelector
            inputLabel={t('user')}
            value={quote?.assigned_user_id}
            onChange={(user) => handleChange('assigned_user_id', user.id)}
            errorMessage={errors?.errors.assigned_user_id}
            readonly={!hasPermission('edit_quote')}
          />

          <div className="lg:pt-1">
            <VendorSelector
              inputLabel={t('vendor')}
              value={quote?.vendor_id}
              onChange={(vendor) => handleChange('vendor_id', vendor.id)}
              onClearButtonClick={() => handleChange('vendor_id', '')}
              errorMessage={errors?.errors.vendor_id}
            />
          </div>

          <DesignSelector
            inputLabel={t('design')}
            value={quote?.design_id}
            onChange={(design) => handleChange('design_id', design.id)}
            onClearButtonClick={() => handleChange('design_id', '')}
            disableWithQueryParameter
            errorMessage={errors?.errors.design_id}
          />
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-6">
          <ProjectSelector
            inputLabel={t('project')}
            value={quote?.project_id}
            onChange={(project) => handleChange('project_id', project.id)}
            errorMessage={errors?.errors.project_id}
          />

          <NumberInputField
            label={t('exchange_rate')}
            value={quote?.exchange_rate || 1.0}
            onValueChange={(value) =>
              handleChange('exchange_rate', parseFloat(value))
            }
            errorMessage={errors?.errors.exchange_rate}
            disablePrecision
          />

          <div className="lg:pt-7">
            <Toggle
              label={t('inclusive_taxes')}
              checked={quote?.uses_inclusive_taxes || false}
              onChange={(value) => handleChange('uses_inclusive_taxes', value)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
