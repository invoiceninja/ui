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

export function EmailReport(props: Props) {
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
    
    </>
    )
    
}