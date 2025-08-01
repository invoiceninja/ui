/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { NumberInputField } from '$app/components/forms/NumberInputField';
import { Button, InputField } from '$app/components/forms';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Schedule, ScheduleParams } from '$app/common/interfaces/schedule';
import { Invoice } from '$app/common/interfaces/invoice';
import Toggle from '$app/components/forms/Toggle';

interface Props {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    schedule: Schedule;
    onSave: (schedule: ScheduleParams, index: number) => void;
    scheduleIndex: number;
    errors: ValidationBag | undefined;
    setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
    remainingAmount: number;
    isFirstSchedule: boolean;
    isAmountMode: boolean;
    minDate: string;
    selectedInvoice: Invoice | null;
}

const defaultSchedule: ScheduleParams = {
    id: 0,
    date: '',
    amount: 0,
    is_amount: true,
};

export function AddScheduleModal(props: Props) {
    const [t] = useTranslation();
    const { 
        visible, 
        setVisible, 
        schedule, 
        onSave, 
        scheduleIndex, 
        errors, 
        setErrors, 
        remainingAmount, 
        isFirstSchedule, 
        isAmountMode, 
        minDate, 
        selectedInvoice 
    } = props;

    // Get next day from a date string
    const getNextDay = (dateStr: string) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    // Calculate remaining amount excluding the current schedule being edited
    const calculateModalRemaining = () => {
        if (!selectedInvoice) {
            return remainingAmount;
        }

        const isAmountMode = schedule.parameters.schedule?.[0]?.is_amount ?? true;
        const totalAmount = selectedInvoice.amount;
        
        const scheduledAmount = schedule.parameters.schedule?.reduce((sum, s, index) => {
            // Exclude the current schedule being edited
            if (index === scheduleIndex) {
                return sum;
            }
            if (s.is_amount !== isAmountMode) {
                return sum + (isAmountMode 
                    ? (s.amount * totalAmount / 100)
                    : (s.amount / totalAmount * 100)
                );
            }
            return sum + s.amount;
        }, 0) || 0;
        
        const remaining = isAmountMode 
            ? Number((totalAmount - scheduledAmount).toFixed(2))
            : Number((100 - scheduledAmount).toFixed(0));
        
        return remaining;
    };

    // Calculate initial amount based on mode and remaining amount
    const getInitialAmount = (isAmount: boolean) => {
        if (scheduleIndex > -1 && schedule.parameters.schedule?.[scheduleIndex]) {
            return schedule.parameters.schedule[scheduleIndex].amount;
        }

        // For new schedules, use the full remaining amount to complete the schedule
        const modalRemaining = calculateModalRemaining();
        if (isAmount) {
            return Number(modalRemaining.toFixed(2)); // Direct amount remaining, 2 decimal places
        } else {
            // For percentage mode, just return the remaining percentage directly
            return Number(modalRemaining.toFixed(0)); // Whole number percentage
        }
    };

    const [currentSchedule, setCurrentSchedule] = useState<ScheduleParams>(defaultSchedule);

    // Only clear errors when modal opens
    useEffect(() => {
        if (visible) {
            setErrors(undefined);
        }
    }, [visible]);

    // Reset and recalculate values when modal opens or when dependencies change
    useEffect(() => {
        if (visible) {
            if (scheduleIndex > -1 && schedule.parameters.schedule?.[scheduleIndex]) {
                // Editing existing schedule
                setCurrentSchedule(schedule.parameters.schedule[scheduleIndex]);
            } else {
                // New schedule - use the mode from the first schedule or default to isAmountMode
                const currentMode = schedule.parameters.schedule?.[0]?.is_amount ?? isAmountMode;
                setCurrentSchedule({
                    ...defaultSchedule,
                    id: (schedule.parameters?.schedule?.length ?? 0) + 1,
                    date: getNextDay(minDate),
                    amount: getInitialAmount(currentMode),
                    is_amount: currentMode
                });
            }
        }
    }, [visible, scheduleIndex, minDate, isAmountMode, selectedInvoice?.amount, schedule]);

    // Reset amount when toggling between % and $ modes
    const handleModeChange = (isAmount: boolean) => {
        const totalAmount = selectedInvoice?.amount || 0;
        const modalRemaining = calculateModalRemaining();
        let newAmount: number;

        if (isAmount) {
            // Converting from % to $
            const dollarAmount = Math.min(
                (totalAmount * currentSchedule.amount) / 100,
                modalRemaining
            );
            newAmount = Number(dollarAmount.toFixed(2)); // 2 decimal places for dollars
        } else {
            // Converting from $ to %
            if (totalAmount > 0) {
                const percentage = Math.min((currentSchedule.amount / totalAmount) * 100, 100);
                newAmount = Number(percentage.toFixed(0)); // Whole number for percentage
            } else {
                newAmount = 0;
            }
        }
        
        setCurrentSchedule(prev => ({
            ...prev,
            id: (schedule.parameters?.schedule?.length ?? 0) + 1,
            is_amount: isAmount,
            amount: newAmount
        }));
    };

    const handleChangeSchedule = (property: keyof ScheduleParams, value: ScheduleParams[keyof ScheduleParams]) => {
        setCurrentSchedule((prev) => ({
            ...prev,
            [property]: value,
        }));
    };

    const validateSchedule = () => {
        const errors: { [key: string]: string[] } = {};

        // 1. Validate date - MUST always be greater than the previous schedule
        if (!currentSchedule.date) {
            errors.date = [t('field_is_required')];
        } else if (currentSchedule.date <= minDate) {
            errors.date = [t('date_must_be_after_previous_schedule')];
        }

        // 2. Validate amount - MUST always be greater than zero
        if (currentSchedule.amount <= 0) {
            errors.amount = [t('amount_must_be_greater_than_zero')];
        } else {
            const modalRemaining = calculateModalRemaining();
            if (currentSchedule.amount > modalRemaining) {
                errors.amount = [currentSchedule.is_amount 
                    ? t('amount_exceeds_remaining_balance', { amount: modalRemaining })
                    : t('percentage_exceeds_remaining', { percent: modalRemaining })];
            }
        }

        return errors;
    };

    const handleSave = () => {
        const validationErrors = validateSchedule();
        
        if (Object.keys(validationErrors).length > 0) {
            // Prevent save if validation fails
            setErrors({ message: '', errors: validationErrors });
            return;
        }

        // Ensure amount is within valid range
        const modalRemaining = calculateModalRemaining();
        const validAmount = Math.min(currentSchedule.amount, modalRemaining);
        const finalSchedule = {
            ...currentSchedule,
            amount: currentSchedule.is_amount 
                ? Number(validAmount.toFixed(2)) // 2 decimal places for dollars
                : Number(validAmount.toFixed(0)) // Whole number for percentage
        };
        
        // Clear errors on successful save
        setErrors(undefined);
        onSave(finalSchedule, scheduleIndex);
    };

    return (
        <Modal
            title={scheduleIndex > -1 ? t('edit_schedule') : t('new_schedule')}
            visible={visible}
            onClose={() => setVisible(false)}
            overflowVisible
        >
            <InputField
                label={t('payment_date')}
                type="date"
                min={minDate}
                value={currentSchedule.date}
                onValueChange={(value) => handleChangeSchedule('date', value)}
                errorMessage={errors?.errors.date}
            />


            <div className="flex flex-col space-y-2">

                <div>
                    <NumberInputField
                        label={currentSchedule.is_amount 
                            ? t('payment_amount') 
                            : t('percent')}
                        value={currentSchedule.amount}
                        onValueChange={(value) => {
                            const amount = parseFloat(value);
                            if (!isNaN(amount)) {
                                handleChangeSchedule('amount', amount);
                            }
                        }}
                        precision={currentSchedule.is_amount ? 2 : 0}
                        errorMessage={errors?.errors.amount}
                    />

                    <div className="text-sm text-gray-600 mt-1">
                        {currentSchedule.is_amount 
                            ? `Remaining: $${calculateModalRemaining()} of $${selectedInvoice?.amount || 0}`
                            : `Remaining: ${calculateModalRemaining()}% of invoice`}
                    </div>
                </div>

                {isFirstSchedule && (
                    <div className="flex items-center space-x-2">
                        <Toggle
                            checked={currentSchedule.is_amount}
                            onValueChange={handleModeChange}
                        />
                        <span>{currentSchedule.is_amount ? t('amount') : t('percent')}</span>
                    </div>
                )}
            </div>

            <Button
                className="self-end"
                onClick={handleSave}
            >
                {t('save')}
            </Button>
        </Modal>
    );
}