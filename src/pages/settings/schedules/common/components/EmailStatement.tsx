/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '@invoiceninja/cards';
import { SelectField } from '@invoiceninja/forms';
import { useAccentColor } from 'common/hooks/useAccentColor';
import { Client } from 'common/interfaces/client';
import { Schedule } from 'common/interfaces/schedule';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useClientsQuery } from 'common/queries/clients';
import { ClientSelector } from 'components/clients/ClientSelector';
import Toggle from 'components/forms/Toggle';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { scheduleParametersAtom } from '../atoms';

interface Props {
  schedule: Schedule;
  handleChange: (
    property: keyof Schedule,
    value: Schedule[keyof Schedule]
  ) => void;
  errors: ValidationBag | undefined;
  page?: 'create' | 'edit';
}

export function EmailStatement(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();

  const parametersAtom = useAtomValue(scheduleParametersAtom);

  const { schedule, handleChange, errors, page } = props;

  const { data: clientsResponse } = useClientsQuery({
    enabled: page === 'edit' || Boolean(parametersAtom),
  });

  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const handleRemoveClient = (clientIndex: number) => {
    const updatedClientsList = selectedClients.filter(
      (client, index) => index !== clientIndex
    );

    setSelectedClients(updatedClientsList);
  };

  useEffect(() => {
    if (page === 'edit' || parametersAtom) {
      const clients = clientsResponse?.filter((client: Client) =>
        schedule.parameters.clients?.includes(client.id)
      );

      setSelectedClients(clients);
    }
  }, []);

  useEffect(() => {
    const currentParameters = { ...schedule.parameters };
    currentParameters.clients = selectedClients?.map(({ id }) => id);

    handleChange('parameters', currentParameters);
  }, [selectedClients]);

  return (
    <>
      <Element leftSide={t('date_range')}>
        <SelectField
          value={schedule.parameters.date_range}
          onValueChange={(value) =>
            handleChange('parameters.date_range' as keyof Schedule, value)
          }
          errorMessage={errors?.errors.date_range}
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
        </SelectField>
      </Element>

      <Element leftSide={t('status')}>
        <SelectField
          value={schedule.parameters.status}
          onValueChange={(value) =>
            handleChange('parameters.status' as keyof Schedule, value)
          }
          errorMessage={errors?.errors.status}
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

      <Element leftSide={t('client')}>
        <ClientSelector
          onChange={(client) =>
            setSelectedClients((prevState) => [...prevState, client])
          }
          withoutAction
          clearInputAfterSelection
          exclude={schedule.parameters.clients}
          staleTime={Infinity}
        />

        <div className="flex justify-center">
          <div className="flex flex-col space-y-2 pt-3">
            {selectedClients?.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between"
              >
                <span>{client.name}</span>

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
