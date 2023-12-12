/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Alert } from '$app/components/Alert';
import { SelectOption } from '$app/components/datatables/Actions';
import { useInvoiceFilters } from '$app/pages/invoices/common/hooks/useInvoiceFilters';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue, StylesConfig } from 'react-select';

interface Props {
  defaultValue?: string;
  onValueChange: (status: string) => void;
  errorMessage?: string[] | string;
}
export function StatusSelector(props: Props) {
  const [t] = useTranslation();
  const filters = useInvoiceFilters();

  const { defaultValue, onValueChange, errorMessage } = props;

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
    multiValueRemove: (styles) => ({
      ...styles,
      ':hover': {
        color: 'white',
      },
      color: '#999999',
    }),
  };

  const handleStatusChange = (
    statuses: MultiValue<{ value: string; label: string }>
  ) =>
    (statuses as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');

  return (
    <>
      <Select
        styles={customStyles}
        defaultValue={
          defaultValue
            ? filters.filter((option) => defaultValue.includes(option.value))
            : null
        }
        onChange={(options) => onValueChange(handleStatusChange(options))}
        placeholder={t('status')}
        options={filters}
        isMulti={true}
      />

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
