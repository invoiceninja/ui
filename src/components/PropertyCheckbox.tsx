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
import { ReactElement, useEffect, useState } from 'react';
import { Checkbox } from './forms';
import { cloneDeep } from 'lodash';
import { Settings } from '$app/common/interfaces/company.interface';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import classNames from 'classnames';

type DefaultValueType = string | boolean | number;

interface Props {
  propertyKey: keyof Settings;
  labelElement: ReactElement;
  defaultValue?: DefaultValueType;
  defaultChecked?: boolean;
}

export function PropertyCheckbox(props: Props) {
  const { propertyKey, defaultValue = '', defaultChecked } = props;

  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [checked, setChecked] = useState<boolean>(
    Boolean(typeof companyChanges?.settings[propertyKey] !== 'undefined') ||
      Boolean(defaultChecked)
  );

  const handleChangeCheckboxValue = (value: boolean) => {
    setChecked(value);

    const updatedCompanySettingsChanges: Settings | undefined = cloneDeep(
      companyChanges?.settings
    );

    if (updatedCompanySettingsChanges) {
      if (value) {
        (updatedCompanySettingsChanges[propertyKey] as DefaultValueType) =
          defaultValue;
      } else {
        delete updatedCompanySettingsChanges[propertyKey];
      }

      handleChange('settings', updatedCompanySettingsChanges);
    }
  };

  useEffect(() => {
    handleChangeCheckboxValue(checked);
  }, [checked]);

  useEffect(() => {
    if (companyChanges?.settings[propertyKey] && !checked) {
      handleChangeCheckboxValue(true);
    }
  }, [companyChanges?.settings[propertyKey]]);

  return (
    <div className="flex items-center">
      {!isCompanySettingsActive && (
        <Checkbox
          checked={checked}
          onValueChange={(_, checked) => setChecked(Boolean(checked))}
        />
      )}

      <div
        className={classNames({
          'opacity-70': !checked,
          'cursor-pointer': !isCompanySettingsActive,
        })}
        onClick={() =>
          !isCompanySettingsActive && setChecked((current) => !current)
        }
      >
        {props.labelElement}
      </div>
    </div>
  );
}
