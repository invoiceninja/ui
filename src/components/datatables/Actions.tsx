/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';
import { InputField } from '../forms/InputField';
import Select, { MultiValue, SingleValue, StylesConfig } from 'react-select';

export interface SelectOption {
  value: string;
  label: string;
  backgroundColor: string;
  color: string;
}

interface Props extends CommonProps {
  options?: SelectOption[];
  defaultOption?: SelectOption;
  optionsPlaceholder?: string;
  optionsMultiSelect?: true | undefined;
  rightSide?: ReactNode;
  onFilterChange?: any;
  onStatusChange?: any;
}

export function Actions(props: Props) {
  const [t] = useTranslation();

  function onStatusChange(
    options:
      | MultiValue<{ value: string; label: string }>
      | SingleValue<{ value: string; label: string }>
  ) {
    const values: string[] = [];

    (options as any).map((option: { value: string; label: string }) =>
      values.push(option.value)
    );

    return props.onStatusChange(values);
  }
  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: data.color,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center space-x-2">
        {props.children}
        {props.options && (
          <Select
            styles={customStyles}
            defaultValue={props.defaultOption}
            onChange={(options) => onStatusChange(options)}
            placeholder={t('status')}
            options={props.options}
            isMulti={props.optionsMultiSelect}
          />
        )}
      </div>
      <div className="mt-2 lg:mt-0 flex items-center space-x-4">
        <InputField
          id="filter"
          placeholder={t('filter')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            props.onFilterChange(event.target.value)
          }
          debounceTimeout={800}
        />
        {props.rightSide}
      </div>
    </div>
  );
}
