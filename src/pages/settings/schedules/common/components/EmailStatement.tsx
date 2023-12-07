/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Client } from '$app/common/interfaces/client';
import { Parameters, Schedule } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useClientsQuery } from '$app/common/queries/clients';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import Toggle from '$app/components/forms/Toggle';
import { atom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
}

export const scheduleParametersAtom = atom<Parameters | undefined>(undefined);

export function EmailStatement(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const parametersAtom = useAtomValue(scheduleParametersAtom);

  const { schedule, handleChange, errors, page } = props;

  const { data: clientsResponse } = useClientsQuery({
    enabled: page === 'edit' || Boolean(parametersAtom),
  });

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const handleChangeParameters = (clients: Client[]) => {
    const currentParameters = { ...schedule.parameters };
    currentParameters.clients = clients.map(({ id }) => id);

    handleChange('parameters', currentParameters);
  };

  const handleRemoveClient = (clientIndex: number) => {
    const updatedClientsList = selectedClients.filter(
      (client, index) => index !== clientIndex
    );

    handleChangeParameters(updatedClientsList);

    setSelectedClients(updatedClientsList);
  };

  useEffect(() => {
    if ((page === 'edit' || parametersAtom) && clientsResponse) {
      const clients = clientsResponse?.filter((client: Client) =>
        schedule.parameters.clients?.includes(client.id)
      );

      setSelectedClients(clients);
    }
  }, [clientsResponse]);

  return (
    <>
      <Element leftSide={t('date_range')}>
        <SelectField
          value={schedule.parameters.date_range}
          onValueChange={(value) =>
            handleChange('parameters.date_range' as keyof Schedule, value)
          }
          errorMessage={errors?.errors['parameters.date_range']}
        >
          <option value="last7_days">{t('last7_days')}</option>
          <option value="last30_days">{t('last30_days')}</option>
          <option value="last365_days">{t('last365_days')}</option>
          <option value="this_month">{t('this_month')}</option>
          <option value="last_month">{t('last_month')}</option>
          <option value="this_quarter">{t('this_quarter')}</option>
          <option value="last_quarter">{t('last_quarter')}</option>
          <option value="this_year">{t('this_year')}</option>
          <option value="last_year">{t('last_year')}</option>
          <option value="all_time">{t('all_time')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('status')}>
        <SelectField
          value={schedule.parameters.status}
          onValueChange={(value) =>
            handleChange('parameters.status' as keyof Schedule, value)
          }
          errorMessage={errors?.errors['parameters.status']}
        >
          <option value="all">{t('all')}</option>
          <option value="paid">{t('paid')}</option>
          <option value="unpaid">{t('unpaid')}</option>
        </SelectField>
      </Element>

      <Element leftSide={t('show_aging_table')}>
        <Toggle
          checked={schedule.parameters.show_aging_table}
          onValueChange={(value) =>
            handleChange('parameters.show_aging_table' as keyof Schedule, value)
          }
        />
      </Element>

      <Element leftSide={t('show_payments_table')}>
        <Toggle
          checked={schedule.parameters.show_payments_table}
          onValueChange={(value) =>
            handleChange(
              'parameters.show_payments_table' as keyof Schedule,
              value
            )
          }
        />
      </Element>

      <Element leftSide={t('show_credits_table')}>
        <Toggle
          checked={schedule.parameters.show_credits_table}
          onValueChange={(value) =>
            handleChange(
              'parameters.show_credits_table' as keyof Schedule,
              value
            )
          }
        />
      </Element>

      <Element leftSide={t('only_clients_with_invoices')}>
        <Toggle
          checked={schedule.parameters.only_clients_with_invoices}
          onValueChange={(value) =>
            handleChange(
              'parameters.only_clients_with_invoices' as keyof Schedule,
              value
            )
          }
        />
      </Element>

      <Element leftSide={t('client')}>
        <ClientSelector
          onChange={(client) => {
            setSelectedClients((prevState) => {
              const currentClients = [...prevState, client];
              handleChangeParameters(currentClients);

              return currentClients;
            });
          }}
          withoutAction
          clearInputAfterSelection
          exclude={schedule.parameters.clients}
        />

        <div className="flex justify-center">
          <div className="flex flex-col space-y-2 pt-3">
            {selectedClients?.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between"
              >
                <span>{client.display_name}</span>

                <MdClose
                  className="cursor-pointer ml-16"
                  fontSize={20}
                  color={accentColor}
                  onClick={() => handleRemoveClient(index)}
                />
              </div>
            ))}
          </div>

          {!selectedClients?.length && (
            <span className="text-gray-500 self-center text-xl mt-4">
              {t('all_clients')}
            </span>
          )}
        </div>
      </Element>
    </>
  );
}
