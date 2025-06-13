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
import { MultiValue } from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { Alert } from '$app/components/Alert';
import { useClientsQuery } from '$app/common/queries/clients';
import { CustomMultiSelect } from '$app/components/forms/CustomMultiSelect';

interface Props {
  value?: string;
  onValueChange: (clientIds: string) => void;
  errorMessage?: string[] | string;
}
export function MultiClientSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { value, onValueChange, errorMessage } = props;

  const [clients, setClients] = useState<SelectOption[]>();

  const { data: clientsResponse } = useClientsQuery({ status: ['active'] });

  useEffect(() => {
    if (clientsResponse) {
      setClients(
        clientsResponse.map((client) => ({
          value: client.id,
          label: client.display_name,
          color: colors.$3,
          backgroundColor: colors.$1,
        }))
      );
    }
  }, [clientsResponse]);

  const handleChange = (
    clients: MultiValue<{ value: string; label: string }>
  ) => {
    return (clients as SelectOption[])
      .map((option: { value: string; label: string }) => option.value)
      .join(',');
  };

  return (
    <>
      {clients ? (
        <Element leftSide={t('clients')}>
          <CustomMultiSelect
            id="clientItemSelector"
            {...(value && {
              value: clients?.filter((option) =>
                value.split(',').find((clientId) => clientId === option.value)
              ),
            })}
            onValueChange={(options) => onValueChange(handleChange(options))}
            options={clients}
            isSearchable={true}
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
