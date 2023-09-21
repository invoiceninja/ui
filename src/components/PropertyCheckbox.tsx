/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useState } from 'react';
import { Checkbox } from './forms';
import { cloneDeep } from 'lodash';
import { Settings } from '$app/common/interfaces/company.interface';

interface Props {
  propertyKey: keyof Settings;
  defaultValue?: boolean;
}

export function PropertyCheckbox(props: Props) {
  const { propertyKey, defaultValue = false } = props;

  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [checked, setChecked] = useState<boolean>(
    Boolean(typeof companyChanges?.settings[propertyKey] !== 'undefined')
  );

  const handleChangeCheckboxValue = (value: boolean) => {
    setChecked(value);

    const updatedCompanySettingsChanges: Settings = cloneDeep(
      companyChanges.settings
    );

    if (value) {
      (updatedCompanySettingsChanges[propertyKey] as boolean) = defaultValue;
    } else {
      delete updatedCompanySettingsChanges[propertyKey];
    }

    handleChange('settings', updatedCompanySettingsChanges);
  };

  return (
    <Checkbox
      checked={checked}
      onValueChange={(_, checked) =>
        handleChangeCheckboxValue(Boolean(checked))
      }
    />
  );
}
