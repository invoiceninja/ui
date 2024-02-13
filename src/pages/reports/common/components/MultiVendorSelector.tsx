/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Spinner } from '$app/components/Spinner';
import { Element } from '$app/components/cards';
import { SelectOption } from '$app/components/datatables/Actions';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { Alert } from '$app/components/Alert';
import { useVendorsQuery } from '$app/common/queries/vendor';
import { useSelectorCustomStyles } from '../hooks/useSelectorCustomStyles';

interface Props {
  value?: string;
  onValueChange: (vendorIds: string) => void;
  errorMessage?: string[] | string;
}
export function MultiVendorSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const customStyles = useSelectorCustomStyles();

  const { value, onValueChange, errorMessage } = props;

  const [vendors, setVendors] = useState<SelectOption[]>();

  const { data: vendorsResponse } = useVendorsQuery({});

  useEffect(() => {
    if (vendorsResponse) {
      setVendors(
        vendorsResponse.map((project) => ({
          value: project.id,
          label: project.name,
          color: colors.$3,
          backgroundColor: colors.$1,
        }))
      );
    }
  }, [vendorsResponse]);

  const handleChange = (
    vendors: MultiValue<{ value: string; label: string }>
  ) => {
    return (vendors as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');
  };

  return (
    <>
      {vendors ? (
        <Element leftSide={t('vendors')}>
          <Select
            id="vendorItemSelector"
            placeholder={t('vendors')}
            {...(value && {
              value: vendors?.filter((option) =>
                value.split(',').find((vendorId) => vendorId === option.value)
              ),
            })}
            onChange={(options) => onValueChange(handleChange(options))}
            options={vendors}
            isMulti={true}
            styles={customStyles}
          />
        </Element>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      {errorMessage && (
        <Alert className="mt-2" type="danger">
          {errorMessage}
        </Alert>
      )}
    </>
  );
}
