/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Payload } from './EInvoiceGenerator';
import { Checkbox } from '../forms';
import classNames from 'classnames';
import { useColorScheme } from '$app/common/colors';

interface Props {
  fieldKey: string;
  payload: Payload;
  setPayload: Dispatch<SetStateAction<Payload>>;
  fieldType: 'decimal' | 'string' | 'number' | 'date' | 'boolean' | 'time';
  label: string;
  helpLabel: string;
  isOptionalField: boolean;
  requiredField: boolean;
}

export function EInvoiceFieldCheckbox(props: Props) {
  const {
    fieldKey,
    payload,
    setPayload,
    fieldType,
    label,
    helpLabel,
    isOptionalField,
    requiredField,
  } = props;

  const colors = useColorScheme();

  const [checked, setChecked] = useState<boolean>(
    Boolean(payload?.[fieldKey] !== undefined)
  );

  useEffect(() => {
    if (checked && Boolean(payload?.[fieldKey] === undefined)) {
      const defaultValue =
        fieldType === 'boolean'
          ? false
          : fieldType === 'decimal' || fieldType === 'number'
          ? 0
          : '';

      setPayload((currentPayload) => ({
        ...currentPayload,
        [fieldKey]: defaultValue,
      }));
    }

    if (!checked && Boolean(payload?.[fieldKey] !== undefined)) {
      delete payload[fieldKey];

      setPayload({ ...payload });
    }
  }, [checked]);

  return (
    <div className="flex items-center">
      {isOptionalField && (
        <Checkbox
          checked={checked}
          onValueChange={(_, value) => setChecked(Boolean(value))}
        />
      )}

      <div
        className={classNames({
          'opacity-75': !checked,
          'cursor-pointer': isOptionalField,
        })}
        onClick={() => isOptionalField && setChecked((current) => !current)}
      >
        <div className="flex flex-col text-sm">
          <span className="font-medium" style={{ color: colors.$3 }}>
            {label}
            {requiredField && <span className="ml-1 text-red-600">*</span>}
          </span>

          {helpLabel && (
            <span
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: helpLabel }}
              style={{ color: colors.$3, opacity: 0.8 }}
            ></span>
          )}
        </div>
      </div>
    </div>
  );
}
