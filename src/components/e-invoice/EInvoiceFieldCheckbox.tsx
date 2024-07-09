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
import { cloneDeep } from 'lodash';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useDispatch } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { Invoice } from '$app/common/interfaces/invoice';

interface Props {
  fieldKey: string;
  payload: Payload;
  setPayload: Dispatch<SetStateAction<Payload>>;
  fieldType: 'decimal' | 'string' | 'number' | 'date' | 'boolean' | 'time';
  label: string;
  helpLabel: string;
  isOptionalField: boolean;
  requiredField: boolean;
  invoice?: Invoice;
  setInvoice?: Dispatch<SetStateAction<Invoice | undefined>>;
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
    invoice,
    setInvoice,
  } = props;

  const dispatch = useDispatch();

  const colors = useColorScheme();
  const company = useCompanyChanges();

  const [checked, setChecked] = useState<boolean>(
    payload?.[fieldKey] !== undefined
  );
  const [isInitialized, setInitialized] = useState<boolean>(false);

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

      const keysLength = fieldKey.split('|').length;

      const updatedPath = fieldKey
        .split('|')
        .filter((_, index) => index !== keysLength - 2)
        .join('|');

      if (company && !invoice) {
        const updatedCompanyEInvoice = cloneDeep(company);

        delete updatedCompanyEInvoice[updatedPath.replaceAll('|', '.')];

        dispatch(
          updateChanges({
            object: 'company',
            property: `e_invoice`,
            value: updatedCompanyEInvoice,
          })
        );
      } else {
        if (invoice && setInvoice) {
          const updatedEntityEInvoice = cloneDeep(invoice);

          delete updatedEntityEInvoice[
            `e_invoice.${updatedPath.replaceAll('|', '.')}` as keyof Invoice
          ];

          setInvoice(updatedEntityEInvoice);
        }
      }

      setPayload({ ...payload });
    }
  }, [checked]);

  useEffect(() => {
    if (payload?.[fieldKey] !== undefined && !isInitialized) {
      setChecked(true);
      setInitialized(true);
    }
  }, [payload?.[fieldKey]]);

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
          'opacity-75': !checked && isOptionalField,
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
