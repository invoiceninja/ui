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
import { InputField, SelectField } from '$app/components/forms';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { Client } from '$app/common/interfaces/client';
import { Parameters, Schedule, ScheduleParams } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useClientsQuery } from '$app/common/queries/clients';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import Toggle from '$app/components/forms/Toggle';
import { atom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { Invoice } from '$app/common/interfaces/invoice';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import colors from '$app/common/constants/colors';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { Plus} from 'react-feather';
import styled from 'styled-components';

interface Props {
    schedule: Schedule;
    handleChange: (
        property: keyof Schedule,
        value: Schedule[keyof Schedule]
    ) => void;
    errors: ValidationBag | undefined;
    page?: 'create' | 'edit';
}
interface NewSchedule {
    date: string;
    amount: number;
    percentage: number;
}

const defaultnewSchedule: NewSchedule = {
    date: '',
    amount: 0,
    percentage: 0,
};


export const scheduleParametersAtom = atom<Parameters | undefined>(undefined);

export function PaymentSchedule(props: Props) {
    const [t] = useTranslation();
    const formatMoney = useFormatMoney();
    const [newSchedule, setNewSchedule] = useState<NewSchedule>(defaultnewSchedule);

    const formatEntityLabel = (entity: Invoice) => {
        return `${entity.number} (${formatMoney(
            entity.amount,
            entity?.client?.country_id,
            entity?.client?.settings.currency_id
        )})`;
    };

    const parametersAtom = useAtomValue(scheduleParametersAtom);

    const { schedule, handleChange, errors, page } = props;
    const [paymentSchedules, setPaymentSchedules] = useState<ScheduleParams[]>([]);

    const handleChangeSchedule = (property: keyof NewSchedule, value: NewSchedule[keyof NewSchedule]) => {
        setNewSchedule(
            (newSchedule) =>
                newSchedule && {
                    ...newSchedule,
                    [property]: value,
                }
        );
    };
    
    const AddRuleButton = styled.div`
    background-color: ${({ theme }) => theme.backgroundColor};

    &:hover {
        background-color: ${({ theme }) => theme.hoverBackgroundColor};
    }
    `;

    const handleAddSchedule = (schedule: ScheduleParams) => {

        paymentSchedules.push(schedule);
        setPaymentSchedules(paymentSchedules);

    }

    const handleRemoveSchedule = (scheduleIndex: number) => {
        const updatedScheduleList = paymentSchedules.filter(
            (schedule, index) => index !== scheduleIndex
        );

        setPaymentSchedules(updatedScheduleList);
    };

    useEffect(() => {
        
    }, []);

    return (
        <>
            
            <Element leftSide={t('invoice')}>
                <ComboboxAsync<Invoice>
                    endpoint={endpoint(
                        '/api/v1/invoices?include=client.group_settings&filter_deleted_clients=true&status=active'
                    )}
                    onChange={(invoice: Entry<Invoice>) =>
                        invoice.resource &&
                        handleChange(
                            'parameters.invoice_id' as keyof Schedule,
                            invoice.resource.id
                        )
                    }
                    inputOptions={{
                        value: schedule.parameters.invoice_id || '',
                    }}
                    entryOptions={{
                        id: 'id',
                        label: 'number',
                        value: 'id',
                        dropdownLabelFn: (invoice) => formatEntityLabel(invoice),
                        inputLabelFn: (invoice) =>
                            invoice ? formatEntityLabel(invoice) : '',
                    }}
                    onDismiss={() =>
                        handleChange('parameters.invoice_id' as keyof Schedule, '')
                    }
                    errorMessage={errors?.errors['parameters.invoice_id']}
                />
            </Element>

{schedule.parameters.invoice_id && (
    <div>
    
                    <Table>
                        <Thead>
                            <Th key="date">{t('date')}</Th>
                            <Th key="amount">{t('amount')}</Th>
                        </Thead>

                        <Tbody>
                            {paymentSchedules.map((schedule: ScheduleParams, index) => (

                            <Tr
                                key={index}
                                className="py-2 border-b"
                            >
                                <Td width="30%">{t(schedule.date)}</Td>

                                <Td>
                                    {schedule.amount > 0 && (
                                        schedule.amount
                                    )}

                                        {schedule.percentage > 0 && (
                                            schedule.percentage
                                        )}%
                                </Td>
                            </Tr>

                            ))}   

                            <Tr>
                                <Td colSpan={100} className="p-1" withoutPadding>
                                    <AddRuleButton
                                        className="w-full py-2 inline-flex justify-center items-center space-x-2 rounded-[0.1875rem] cursor-pointer"
                                        onClick={() => {
                                            setRuleIndex(-1);
                                            setIsRuleModalOpen(true);
                                        }}
                                        theme={{
                                            backgroundColor: colors.$1,
                                            hoverBackgroundColor: colors.$20,
                                        }}
                                    >
                                        <Plus color={colors.$3} size="1rem" />

                                        <span>{t('add_rule')}</span>
                                    </AddRuleButton>
                                </Td>
                            </Tr>                             
                        </Tbody>
                    </Table>

            <Element leftSide={t('schedule')}>
                <div className="flex justify-center">
                    <div className="flex flex-col space-y-2 pt-3">
                    {paymentSchedules.map((schedule: ScheduleParams, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between"
                        >
                            <span>{schedule.date}</span>
                            {schedule.percentage > 0 && (
                                <span>{schedule.percentage} %</span>
                            )}
                            {schedule.amount > 0 && (
                                <span>{schedule.amount}</span>
                            )}
                            <div
                                className="cursor-pointer ml-16"
                                onClick={() => handleRemoveClient(index)}
                            >
                                <CircleXMark
                                    color={colors.$16}
                                    hoverColor={colors.$3}
                                    borderColor={colors.$5}
                                    hoverBorderColor={colors.$17}
                                    size="1.6rem"
                                />
                            </div>
                        </div>
                    ))}  
                    </div>
                </div>
            </Element>

            <Element leftSide={t('add_schedule')}>
                <InputField
                    type="date"
                    min={new Date().toISOString()}
                    value={newSchedule.date}
                    onValueChange={(value) => handleChangeSchedule('date', value)}
                    errorMessage={errors?.errors.date}
                />

                <NumberInputField
                    label={t('amount')}
                    value={newSchedule.amount || 0}
                    onValueChange={(value) =>
                        handleChangeSchedule('amount', parseFloat(value))
                    }
                    errorMessage={errors?.errors.amount}
                />

                <NumberInputField
                    label={t('percentage')}
                    precision={0}
                    value={newSchedule.percentage || 0}
                    onValueChange={(value) =>
                        handleChangeSchedule('percentage', parseFloat(value))
                    }
                    errorMessage={errors?.errors.amount}
                />
            </Element>

            <Element leftSide={t('auto_bill')}>
                <Toggle
                    checked={schedule.parameters.auto_bill}
                    onValueChange={(value) =>
                        handleChange(
                            'parameters.auto_bill' as keyof Schedule,
                            value
                        )
                    }
                />
            </Element>
            </div>
            )}
        </>
    );
}
