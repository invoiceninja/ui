/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectOption } from '$app/components/datatables/Actions';
import { StylesConfig } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { merge } from 'lodash';

export function useSelectorCustomStyles() {
  const colors = useColorScheme();

  const customStyles: StylesConfig<SelectOption, true> = {
    multiValue: (styles, { data }) => {
      return merge(styles, {
        backgroundColor: data.backgroundColor,
        color: data.color,
        borderRadius: '3px',
      });
    },
    multiValueLabel: (styles, { data }) => {
      return merge(styles, {
        color: data.color,
      });
    },
    multiValueRemove: (styles) => {
      return merge(styles, {
        ':hover': {
          color: 'white',
        },
        color: '#999999',
      });
    },
    menu: (base) => {
      return merge(base, {
        width: 'max-content',
        minWidth: '100%',
        backgroundColor: colors.$4,
        borderColor: colors.$4,
      });
    },
    control: (base) => {
      return merge(base, {
        borderRadius: '3px',
        backgroundColor: colors.$1,
        color: colors.$3,
        borderColor: colors.$5,
      });
    },
    option: (base) => {
      return merge(base, {
        backgroundColor: colors.$1,
        ':hover': {
          backgroundColor: colors.$7,
        },
      });
    },
  };

  const newCustomStyles: StylesConfig<SelectOption, true> = {
    control: (base) => ({
      ...base,
      backgroundColor: colors.$1,
      borderColor: colors.$24,
      borderRadius: '0.375rem',
      padding: '0 6px',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0px 8px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#6b7280',
      padding: '0 8px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: colors.$1,
      border: `1px solid ${colors.$19}`,
      zIndex: 10,
      width: '16rem',
      boxShadow: 'none',
    }),
    option: (base) => ({
      ...base,
      color: colors.$3,
      backgroundColor: colors.$1,
      padding: '8px 12px',
      cursor: 'pointer',
      borderRadius: '0.1875rem',
      '&:hover': {
        backgroundColor: colors.$4,
      },
    }),
  };

  return { customStyles, newCustomStyles };
}
