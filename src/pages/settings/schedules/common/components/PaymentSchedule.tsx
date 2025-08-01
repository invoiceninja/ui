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
import { Parameters, Schedule, ScheduleParams } from '$app/common/interfaces/schedule';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { atom, useAtomValue } from 'jotai';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoint } from '$app/common/helpers';
import { Invoice } from '$app/common/interfaces/invoice';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { AddScheduleModal } from './AddScheduleModal';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { Icon } from '$app/components/icons/Icon';
import { MdAdd } from 'react-icons/md';

interface Props {
    schedule: Schedule;
    handleChange: (
        property: keyof Schedule,
        value: Schedule[keyof Schedule]
    ) => void;
    errors: ValidationBag | undefined;
    setErrors: React.Dispatch<React.SetStateAction<ValidationBag | undefined>>;
    page?: 'create' | 'edit';
}

interface PaymentScheduleParameters extends Parameters {
    schedule: ScheduleParams[];
    invoice_id: string;
    auto_bill: boolean;
}

export const scheduleParametersAtom = atom<PaymentScheduleParameters | undefined>(undefined);

export function PaymentSchedule(props: Props) {
    const [t] = useTranslation();
    const formatMoney = useFormatMoney();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(-1);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    const { schedule, handleChange, errors, setErrors, page } = props;

    // Fetch invoice data if invoice_id exists in schedule parameters
    const { data: fetchedInvoice } = useInvoiceQuery({ 
        id: schedule?.parameters?.invoice_id || '', 
        includeIsLocked: false 
    });

    // State for schedules - this is the single source of truth
    const [schedules, setSchedules] = useState<ScheduleParams[]>([]);
    const [isComplete, setIsComplete] = useState(true);
    const [remainingAmount, setRemainingAmount] = useState(0);
    
    // Local error state for the modal
    const [modalErrors, setModalErrors] = useState<ValidationBag | undefined>(undefined);

    // Initialize schedules and invoice from props
    useEffect(() => {
        if (schedule?.parameters?.schedule) {
            setSchedules(schedule.parameters.schedule);
        } else {
            setSchedules([]);
        }
        
        // Set the fetched invoice
        if (fetchedInvoice) {
            setSelectedInvoice(fetchedInvoice);
        }
    }, [schedule?.parameters?.schedule, fetchedInvoice]);

    // Update isComplete and remainingAmount when schedules change
    useEffect(() => {
        if (schedules.length === 0) {
            setIsComplete(false);
            setRemainingAmount(0);
            return;
        }

        if (!selectedInvoice) {
            // No invoice selected - calculate remaining based on schedules
            const isAmountMode = schedules[0]?.is_amount ?? true;
            
            if (isAmountMode) {
                // For amount mode, estimate remaining based on total scheduled
                const totalScheduled = schedules.reduce((sum, s) => sum + s.amount, 0);
                // Assume a reasonable remaining amount (e.g., 10% of total scheduled)
                const estimatedTotal = totalScheduled / 0.9; // If 90% is scheduled, 10% remains
                const remaining = Math.max(0, estimatedTotal - totalScheduled);
                
                setIsComplete(remaining <= 0);
                setRemainingAmount(remaining);
            } else {
                // For percentage mode, calculate remaining percentage
                const totalPercentage = schedules.reduce((sum, s) => sum + s.amount, 0);
                const remaining = Math.max(0, 100 - totalPercentage);
                
                setIsComplete(remaining <= 0);
                setRemainingAmount(remaining);
            }
            return;
        }

        // Calculate remaining amount with invoice
        const isAmountMode = schedules[0]?.is_amount ?? true;
        const totalAmount = selectedInvoice.amount;
        
        const scheduledAmount = schedules.reduce((sum, s) => {
            if (s.is_amount !== isAmountMode) {
                return sum + (isAmountMode 
                    ? (s.amount * totalAmount / 100)
                    : (s.amount / totalAmount * 100)
                );
            }
            return sum + s.amount;
        }, 0);
        
        const remaining = isAmountMode 
            ? Number((totalAmount - scheduledAmount).toFixed(2))
            : Number((100 - scheduledAmount).toFixed(0));
        
        setIsComplete(remaining <= 0);
        setRemainingAmount(remaining);
    }, [schedules, selectedInvoice]);

    // Enhanced schedule object for the modal
    const enhancedSchedule = {
        ...schedule,
        parameters: {
            ...schedule.parameters,
            schedule: schedules
        }
    };

    // Format entity label
    const formatEntityLabel = (entity: Invoice) => {
        return `${entity.number} (${formatMoney(
            entity.amount,
            entity?.client?.country_id,
            entity?.client?.settings.currency_id
        )})`;
    };

    // Handle adding new schedule
    const handleAddNewSchedule = () => {
        setSelectedScheduleIndex(-1);
        setIsModalOpen(true);
    };

    // Format schedule amount
    const formatScheduleAmount = (schedule: ScheduleParams) => {
        if (schedule.is_amount) {
            return formatMoney(schedule.amount, '', '');
        } else {
            return schedule.amount + ' %';
        }
    };

    // Handle removing a schedule
    const handleRemoveSchedule = (scheduleIndex: number) => {
        const updatedSchedules = schedules.filter((_, index) => index !== scheduleIndex);
        
        // Update local state
        setSchedules(updatedSchedules);
        
        // Immediately update isComplete and remainingAmount
        if (updatedSchedules.length === 0) {
            setIsComplete(false);
            setRemainingAmount(0);
        } else if (!selectedInvoice) {
            // No invoice selected - calculate remaining based on schedules
            const isAmountMode = updatedSchedules[0]?.is_amount ?? true;
            
            if (isAmountMode) {
                // For amount mode, estimate remaining based on total scheduled
                const totalScheduled = updatedSchedules.reduce((sum, s) => sum + s.amount, 0);
                // Assume a reasonable remaining amount (e.g., 10% of total scheduled)
                const estimatedTotal = totalScheduled / 0.9; // If 90% is scheduled, 10% remains
                const remaining = Math.max(0, estimatedTotal - totalScheduled);
                
                setIsComplete(remaining <= 0);
                setRemainingAmount(remaining);
            } else {
                // For percentage mode, calculate remaining percentage
                const totalPercentage = updatedSchedules.reduce((sum, s) => sum + s.amount, 0);
                const remaining = Math.max(0, 100 - totalPercentage);
                
                setIsComplete(remaining <= 0);
                setRemainingAmount(remaining);
            }
        } else {
            // Calculate remaining amount with invoice
            const isAmountMode = updatedSchedules[0]?.is_amount ?? true;
            const totalAmount = selectedInvoice.amount;
            
            const scheduledAmount = updatedSchedules.reduce((sum, s) => {
                if (s.is_amount !== isAmountMode) {
                    return sum + (isAmountMode 
                        ? (s.amount * totalAmount / 100)
                        : (s.amount / totalAmount * 100)
                    );
                }
                return sum + s.amount;
            }, 0);
            
            const remaining = isAmountMode 
                ? Number((totalAmount - scheduledAmount).toFixed(2))
                : Number((100 - scheduledAmount).toFixed(0));
            
            setIsComplete(remaining <= 0);
            setRemainingAmount(remaining);
        }
        
        // Update parent
        const currentParameters: PaymentScheduleParameters = {
            ...schedule.parameters as PaymentScheduleParameters,
            schedule: updatedSchedules,
            auto_bill: (schedule.parameters as PaymentScheduleParameters)?.auto_bill ?? false,
        };

        handleChange('parameters', currentParameters);
        
        // Clear API errors on successful update
        if (errors?.errors['parameters.schedule']) {
            setErrors(undefined);
        }
    };

    // Get latest schedule date
    const getLatestScheduleDate = () => {
        if (schedules.length === 0) {
            return new Date().toISOString().split('T')[0];
        }
        return schedules[schedules.length - 1].date;
    };

    // Check if a schedule is in the past
    const isScheduleInPast = (scheduleDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        const scheduleDateObj = new Date(scheduleDate);
        return scheduleDateObj < today;
    };

    // Handle schedule update (add or edit)
    const handleScheduleUpdate = (updatedSchedule: ScheduleParams, index: number) => {
        let newSchedules: ScheduleParams[];
        
        if (index >= 0 && index < schedules.length) {
            // Editing existing schedule
            newSchedules = schedules.map((s, i) => i === index ? updatedSchedule : s);
        } else {
            // Adding new schedule
            newSchedules = [...schedules, updatedSchedule];
        }

        // Update local state
        setSchedules(newSchedules);
        
        // Immediately update isComplete and remainingAmount
        if (newSchedules.length === 0) {
            setIsComplete(false);
            setRemainingAmount(0);
        } else if (!selectedInvoice) {
            // No invoice selected - calculate remaining based on schedules
            const isAmountMode = newSchedules[0]?.is_amount ?? true;
            
            if (isAmountMode) {
                // For amount mode, estimate remaining based on total scheduled
                const totalScheduled = newSchedules.reduce((sum, s) => sum + s.amount, 0);
                // Assume a reasonable remaining amount (e.g., 10% of total scheduled)
                const estimatedTotal = totalScheduled / 0.9; // If 90% is scheduled, 10% remains
                const remaining = Math.max(0, estimatedTotal - totalScheduled);
                
                setIsComplete(remaining <= 0);
                setRemainingAmount(remaining);
            } else {
                // For percentage mode, calculate remaining percentage
                const totalPercentage = newSchedules.reduce((sum, s) => sum + s.amount, 0);
                const remaining = Math.max(0, 100 - totalPercentage);
                
                setIsComplete(remaining <= 0);
                setRemainingAmount(remaining);
            }
        } else {
            // Calculate remaining amount with invoice
            const isAmountMode = newSchedules[0]?.is_amount ?? true;
            const totalAmount = selectedInvoice.amount;
            
            const scheduledAmount = newSchedules.reduce((sum, s) => {
                if (s.is_amount !== isAmountMode) {
                    return sum + (isAmountMode 
                        ? (s.amount * totalAmount / 100)
                        : (s.amount / totalAmount * 100)
                    );
                }
                return sum + s.amount;
            }, 0);
            
            const remaining = isAmountMode 
                ? Number((totalAmount - scheduledAmount).toFixed(2))
                : Number((100 - scheduledAmount).toFixed(0));
            
            setIsComplete(remaining <= 0);
            setRemainingAmount(remaining);
        }
        
        // Update parent
        const currentParameters: PaymentScheduleParameters = {
            ...schedule.parameters as PaymentScheduleParameters,
            schedule: newSchedules,
            auto_bill: (schedule.parameters as PaymentScheduleParameters)?.auto_bill ?? false,
        };

        handleChange('parameters', currentParameters);
        
        // Clear API errors on successful update
        if (errors?.errors['parameters.schedule']) {
            setErrors(undefined);
        }
        
        // Close the modal
        setIsModalOpen(false);
    };

    function formatRemainingAmount() {

        const isAmountMode = schedules[0]?.is_amount ?? true;

        if (isAmountMode) {
            return formatMoney(remainingAmount, '', '') + ' ' + t('remaining');
        }
        else{
            return remainingAmount + ' % ' + t('remaining');
        }
    }
    return (
        <>
            <Element leftSide={t('invoice')}>
                <ComboboxAsync<Invoice>
                    endpoint={endpoint(
                        '/api/v1/invoices?include=client.group_settings&filter_deleted_clients=true&status=active'
                    )}
                    onChange={(invoice: Entry<Invoice>) => {
                        if (invoice.resource) {
                            setSelectedInvoice(invoice.resource);
                            handleChange(
                                'parameters.invoice_id' as keyof Schedule,
                                invoice.resource.id
                            );
                        }
                    }}
                    inputOptions={{
                        value: schedule.parameters.invoice_id || '',
                    }}
                    readonly={page === 'edit'} // Disable when editing
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
            
            <Element
                leftSide={t('auto_bill')}
                leftSideHelp={t('auto_bill_help')}
            >
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

            {(selectedInvoice || schedules.length > 0) && (
                <div>
                    
                    
                    {schedules.length > 0 && (
                        <>
                            
                            
                            <Table>
                                <Thead>
                                    <Th  key="date">{t('date')}</Th>
                                    <Th  key="amount">{t('amount')}</Th>
                                    <Th  key="action">{t('action')}</Th>
                                </Thead>

                                <Tbody>
                                    {schedules.map((schedule: ScheduleParams, index) => (
                                        <Tr
                                            key={index}
                                            className={`border-b ${isScheduleInPast(schedule.date) ? 'opacity-60' : ''}`}
                                        >
                                            <Td width="30%">{schedule.date}</Td>
                                            <Td>{formatScheduleAmount(schedule)}</Td>
                                            <Td>
                                                <div className="">
                                                    <Button 
                                                        onClick={() => handleRemoveSchedule(index)}
                                                        disabled={isScheduleInPast(schedule.date)}
                                                    >
                                                        {t('remove')}
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ))}

                                    {!isComplete && (
                                        <Tr>
                                            <Td colSpan={3} className="text-center py-3">
                                                <Button onClick={handleAddNewSchedule}>
                                                    {t('add')}
                                                </Button>
                                                {errors?.errors['parameters.schedule'][0] && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors.errors['parameters.schedule'][0]}
                                                    </div>
                                                )}
                                            </Td>
                                        </Tr>
                                    )}

                                   
                                </Tbody>
                            </Table>

                            {isComplete && (
                                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex justify-center">
                                    {t('complete')} {formatRemainingAmount()}
                                </div>
                            )}

                            {!isComplete && (
                                <div className="mb-4 p-4 bg-orange-50 text-red-700 rounded-md flex justify-center">
                                    {formatRemainingAmount()}
                                </div>
                            )}
                        </>
                    )}

                    {/* Show add schedule button when no schedules exist but invoice is selected */}
                    {schedules.length === 0 && selectedInvoice && (
                        <div className="mb-4 flex justify-center">
                            <Button onClick={handleAddNewSchedule}>
                                {t('schedule')}
                            </Button>
                        </div>
                    )}

                    {errors?.errors['parameters.schedule'] && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex justify-center">
                            {errors.errors['parameters.schedule'][0]}
                        </div>
                    )}

                    
                </div>
            )}

            <AddScheduleModal
                visible={isModalOpen}
                setVisible={setIsModalOpen}
                schedule={enhancedSchedule}
                onSave={handleScheduleUpdate}
                scheduleIndex={selectedScheduleIndex}
                errors={modalErrors}
                setErrors={setModalErrors}
                remainingAmount={remainingAmount}
                isFirstSchedule={schedules.length === 0}
                isAmountMode={schedules[0]?.is_amount ?? true}
                minDate={getLatestScheduleDate()}
                selectedInvoice={selectedInvoice}
            />
        </>
    );
}