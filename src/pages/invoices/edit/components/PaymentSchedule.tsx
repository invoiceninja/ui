/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Paymentable } from '$app/common/interfaces/payment';

import { useNavigate, useOutletContext } from 'react-router-dom';
import { Context } from '../Edit';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useTranslation } from 'react-i18next';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Card } from '$app/components/cards';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '$app/components/forms';
import { InputField } from '$app/components/forms';
import { SelectField } from '$app/components/forms';
import { Element } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import classNames from 'classnames';
import { PaymentSchedule as ScheduleComponent } from '$app/pages/settings/schedules/common/components/PaymentSchedule';
import { Schedule } from '$app/common/interfaces/schedule';
import frequencies from '$app/common/constants/frequency';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';

const Box = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

// Wizard step types
type WizardStep = 
  | 'initial-choice'
  | 'number-payments'
  | 'frequency'
  | 'first-payment-date'
  | 'auto-bill'
  | 'custom-schedule';

function PaymentSchedule() {
  const [t] = useTranslation();

  const context: Context = useOutletContext();
  const { invoice } = context;

  const colors = useColorScheme();

  const navigate = useNavigate();
  const formatMoney = useFormatMoney();
  const disableNavigation = useDisableNavigation();
  const queryClient = useQueryClient();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('initial-choice');
  const [scheduleType, setScheduleType] = useState<'number-payments' | 'custom' | null>(null);
  const [numberOfPayments, setNumberOfPayments] = useState<string>('2');
  const [frequency, setFrequency] = useState<string>('5');
  const [firstPaymentDate, setFirstPaymentDate] = useState<string>('');
  const [autoBill, setAutoBill] = useState<boolean>(false);

  // API state
  const [isCreatingSchedule, setIsCreatingSchedule] = useState<boolean>(false);
  const [isRemovingSchedule, setIsRemovingSchedule] = useState<boolean>(false);
  const [scheduleErrors, setScheduleErrors] = useState<ValidationBag | undefined>(undefined);
  
  // Local invoice state to handle updates without page reload
  const [localInvoice, setLocalInvoice] = useState(invoice);

  // Schedule state for the PaymentSchedule component
  const [schedule, setSchedule] = useState<Schedule>({
    id: 'temp-schedule',
    name: 'Payment Schedule',
    frequency_id: '5',
    next_run: new Date().toISOString(),
    template: 'payment_schedule',
    is_paused: false,
    is_deleted: false,
    remaining_cycles: -1,
    parameters: {
      date_range: '',
      show_payments_table: false,
      show_credits_table: false,
      show_aging_table: false,
      only_clients_with_invoices: false,
      status: '',
      clients: [],
      entity: 'invoice',
      entity_id: '',
      report_name: '',
      start_date: '',
      end_date: '',
      product_key: '',
      send_email: false,
      is_expense_billed: false,
      is_income_billed: false,
      include_tax: false,
      client_id: '',
      vendors: '',
      categories: '',
      projects: '',
      report_keys: [],
      schedule: [],
      invoice_id: invoice?.id || '',
      auto_bill: false,
    },
    updated_at: Date.now(),
    created_at: Date.now(),
    archived_at: 0,
  });

  // Update schedule when invoice changes
  useEffect(() => {
    setSchedule(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        invoice_id: invoice?.id || '',
      }
    }));
  }, [invoice?.id]);

  // Update local invoice when context invoice changes
  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);




  const handleNext = () => {
    switch (currentStep) {
      case 'initial-choice':
        if (scheduleType === 'number-payments') {
          setCurrentStep('number-payments');
        } else if (scheduleType === 'custom') {
          setCurrentStep('custom-schedule');
        }
        break;
      case 'number-payments':
        setCurrentStep('frequency');
        break;
      case 'frequency':
        setCurrentStep('first-payment-date');
        break;
      case 'first-payment-date':
        setCurrentStep('auto-bill');
        break;
      case 'auto-bill':
        // This is the final step for number-payments flow
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'number-payments':
        setCurrentStep('initial-choice');
        break;
      case 'frequency':
        setCurrentStep('number-payments');
        break;
      case 'first-payment-date':
        setCurrentStep('frequency');
        break;
      case 'auto-bill':
        setCurrentStep('first-payment-date');
        break;
      case 'custom-schedule':
        setCurrentStep('initial-choice');
        break;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'initial-choice':
        return scheduleType !== null;
      case 'number-payments':
        return parseInt(numberOfPayments) > 0;
      case 'frequency':
        return frequency !== '';
      case 'first-payment-date':
        return firstPaymentDate !== '';
      case 'auto-bill':
        return true; // auto_bill is optional, so always allow proceeding
      default:
        return true;
    }
  };

  // Create schedule for number-payments scenario
  const handleCreateNumberPaymentsSchedule = () => {
    if (!isCreatingSchedule && invoice) {
      setIsCreatingSchedule(true);
      setScheduleErrors(undefined);
      toast.processing();

      const payload = {
        template: 'payment_schedule',
        next_run: firstPaymentDate,
        remaining_cycles: parseInt(numberOfPayments),
        frequency_id: frequency,
        parameters: {
          invoice_id: invoice.id,
          auto_bill: autoBill,
          schedule: [], 
        },
      };

      request('POST', endpoint('/api/v1/invoices/:id/payment_schedule?show_schedule=true', { id: invoice.id }), payload)
        .then((response) => {
          toast.success('created_schedule');
          
          // Check if the response contains schedule data
          if (response?.data?.data?.schedule && response.data.data.schedule.length > 0) {
            // Update the local invoice with the new schedule data
            setLocalInvoice(prev => prev ? {
              ...prev,
              schedule: response.data.data.schedule
            } : undefined);

           
          } else {
          }
        })
        .catch((e: AxiosError<ValidationBag>) => {
          if (e.response?.status === 422) {
            setScheduleErrors(e.response.data);
            toast.dismiss();
          } else {
            toast.error('error_occurred');
          }
        })
        .finally(() => {
          setIsCreatingSchedule(false);
          queryClient.invalidateQueries({ queryKey: ['/api/v1/invoices', invoice?.id] });
          console.log('invalidated');
        });
    }
  };

  // Create schedule for custom scenario
  const handleCreateCustomSchedule = () => {
    if (!isCreatingSchedule && schedule) {
      setIsCreatingSchedule(true);
      setScheduleErrors(undefined);
      toast.processing();

      const payload = {
        template: 'payment_schedule',
        next_run: new Date().toISOString(),
        parameters: {
          invoice_id: schedule.parameters.invoice_id,
          auto_bill: schedule.parameters.auto_bill,
          schedule: schedule.parameters.schedule,
        },
      };

      request(
        'POST',
        endpoint('/api/v1/task_schedulers'),
        payload
      )
        .then((response) => {
          toast.success('created_schedule');
          
          // Check if the response contains schedule data
          if (response?.data?.data?.schedule && response.data.data.schedule.length > 0) {
            // Update the local invoice with the new schedule data
            setLocalInvoice(prev => prev ? {
              ...prev,
              schedule: response.data.data.schedule
            } : undefined);
          } else {
            // If no schedule in response, just show success
            console.log('Schedule created but no schedule data in response');
          }
        })
        .catch((error) => {
          if (error instanceof AxiosError && error.response?.status === 422) {
            setScheduleErrors(error.response.data);
            toast.dismiss();
          } else {
            toast.error('error_occurred');
          }
        })
        .finally(() => {
          setIsCreatingSchedule(false);
          queryClient.invalidateQueries({ queryKey: ['/api/v1/invoices', invoice?.id] });
          console.log('invalidated');
        });
    }
  };

  // Remove existing schedule
  const handleRemoveSchedule = () => {
    if (!isRemovingSchedule && invoice) {
      setIsRemovingSchedule(true);
      setScheduleErrors(undefined);
      toast.processing();

      request(
        'DELETE',
        endpoint('/api/v1/invoices/:id/payment_schedule', { id: invoice.id })
      )
        .then(() => {
          toast.success('removed_schedule');
          
          // Update the local invoice to remove the schedule
          setLocalInvoice(prev => prev ? {
            ...prev,
            schedule: []
          } : undefined);
          
          // Reset wizard state to start from the beginning
          setCurrentStep('initial-choice');
          setScheduleType(null);
          setNumberOfPayments('2');
          setFrequency('5');
          setFirstPaymentDate('');
          setAutoBill(false);
        })
        .catch((e: AxiosError<ValidationBag>) => {
          if (e.response?.status === 422) {
            setScheduleErrors(e.response.data);
            toast.dismiss();
          } else {
            toast.error('error_occurred');
          }
        })
        .finally(() => {
          setIsRemovingSchedule(false);
        });
    }
  };

  // Helper function to check if a date is in the past
  const isDateInPast = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const scheduleDate = new Date(dateString);
    return scheduleDate < today;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStep = () => {
    // Check if invoice has an existing schedule
    const hasExistingSchedule = localInvoice?.schedule && localInvoice.schedule.length > 0;

    // If there's an existing schedule, display it instead of the wizard
    if (hasExistingSchedule) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">{t('existing_payment_schedule')}</h2>
            <p className="text-gray-600 mb-6">{t('invoice_has_existing_schedule')}</p>
          </div>
          
          <div className="space-y-4">
            {/* Schedule Display */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">{t('payment_schedule')}</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {localInvoice.schedule?.map((scheduleItem, index) => {
                  const isPast = isDateInPast(scheduleItem.date);
                  return (
                    <div 
                      key={index}
                      className={`px-4 py-3 flex justify-between items-center ${
                        isPast ? 'bg-gray-50 opacity-75' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          isPast ? 'bg-gray-400' : 'bg-green-500'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            isPast ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {formatDate(scheduleItem.date)}
                          </div>
                          <div className={`text-sm ${
                            isPast ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {isPast ? t('past_due') : t('upcoming')}
                          </div>
                          <div className={`text-sm ${isPast ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            {t('auto_bill')}: {scheduleItem.auto_bill ? t('enabled') : t('disabled')}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        isPast ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {scheduleItem.amount}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remove Schedule Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleRemoveSchedule}
                disabled={isRemovingSchedule}
                className="text-red-600 border-red-600 hover:bg-red-50 border"
              >
                {isRemovingSchedule ? t('removing') : t('clear')}
              </Button>
            </div>

            {scheduleErrors && (
              <div className="p-4 bg-red-50 text-red-700 rounded-md">
                {Object.values(scheduleErrors.errors).flat().join(', ')}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Original wizard logic for creating new schedules
    switch (currentStep) {
      case 'initial-choice':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('create_payment_schedule')}</h2>
              <p className="text-gray-600 mb-6">{t('choose_schedule_type')}</p>
            </div>
            
            <div className="space-y-4">
              <div 
                className={classNames(
                  "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                  scheduleType === 'number-payments' 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setScheduleType('number-payments')}
              >
                <h3 className="font-medium mb-2">{t('split_into_payments')}</h3>
                <p className="text-sm text-gray-600">{t('split_into_payments_description')}</p>
              </div>
              
              <div 
                className={classNames(
                  "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                  scheduleType === 'custom' 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setScheduleType('custom')}
              >
                <h3 className="font-medium mb-2">{t('custom_schedule')}</h3>
                <p className="text-sm text-gray-600">{t('custom_schedule_description')}</p>
              </div>
            </div>
          </div>
        );

      case 'number-payments':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('how_many_payments')}</h2>
              <p className="text-gray-600 mb-6">{t('split_invoice_into_payments')}</p>
            </div>
            
            <Element leftSide={t('number_of_payments')}>
              <InputField
                type="number"
                value={numberOfPayments}
                onValueChange={(value) => setNumberOfPayments(value)}
                min="1"
              />
            </Element>
          </div>
        );

      case 'frequency':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('payment_frequency')}</h2>
              <p className="text-gray-600 mb-6">{t('how_often_payments')}</p>
            </div>
            
            <Element leftSide={t('frequency')}>
                <SelectField
                    value={frequency}
                    onValueChange={(value) => setFrequency(value)}
                    errorMessage={undefined}
                    customSelector
                    dismissable={false}
                >
                    {Object.keys(frequencies).map((frequency, index) => (
                        <option key={index} value={frequency}>
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                            {/* @ts-ignore */}
                            {t(frequencies[frequency])}
                        </option>
                    ))}
                </SelectField>
            </Element>
          </div>
        );

      case 'first-payment-date':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('first_payment_date')}</h2>
              <p className="text-gray-600 mb-6">{t('when_first_payment_due')}</p>
            </div>
            
            <Element leftSide={t('first_payment_date')}>
              <input
                type="date"
                value={firstPaymentDate}
                onChange={(e) => {
                  setFirstPaymentDate(e.target.value);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </Element>

            {/* Display specific field errors */}
            {scheduleErrors?.errors['parameters.first_payment_date'] && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                {scheduleErrors.errors['parameters.first_payment_date'].map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}

            {/* Display general schedule errors */}
            {scheduleErrors && Object.keys(scheduleErrors.errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {Object.values(scheduleErrors.errors).flat().join(', ')}
              </div>
            )}
          </div>
        );

      case 'auto-bill':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('auto_bill')}</h2>
              <p className="text-gray-600 mb-6">{t('auto_bill_help')}</p>
            </div>
            
            <Element leftSide={t('auto_bill')}>
              <Toggle
                checked={autoBill}
                onValueChange={(value) => setAutoBill(value)}
              />
            </Element>

            {/* Display general schedule errors */}
            {scheduleErrors && Object.keys(scheduleErrors.errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {Object.values(scheduleErrors.errors).flat().join(', ')}
              </div>
            )}
          </div>
        );

      case 'custom-schedule':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">{t('custom_payment_schedule')}</h2>
              <p className="text-gray-600 mb-6">{t('create_custom_schedule')}</p>
            </div>
            
            <ScheduleComponent
              schedule={schedule}
              handleChange={(property, value) => {
                // Update the schedule state when changes are made
                setSchedule(prev => ({
                  ...prev,
                  [property]: value
                }));
              }}
              errors={scheduleErrors}
              setErrors={setScheduleErrors}
              page="create"
              disableInvoiceSelection={true}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      title={t('payment_schedule')}
      className="shadow-sm"
      style={{ maxHeight: '42.5rem', borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
      withScrollableBody
    >
      <div className="p-6">
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          {/* Show buttons only if there's no existing schedule */}
          {!localInvoice?.schedule?.length && (
            <>
              {currentStep !== 'initial-choice' && (
                <Button onClick={handleBack}>
                  {t('back')}
                </Button>
              )}
              
              {currentStep === 'auto-bill' && (
                <Button 
                  onClick={handleCreateNumberPaymentsSchedule}
                  disabled={!canProceed() || isCreatingSchedule}
                  className="ml-auto"
                >
                  {isCreatingSchedule ? t('creating') : t('save')}
                </Button>
              )}
              
              {currentStep === 'custom-schedule' && (
                <Button 
                  onClick={handleCreateCustomSchedule}
                  disabled={isCreatingSchedule}
                  className="ml-auto"
                >
                  {isCreatingSchedule ? t('creating') : t('save')}
                </Button>
              )}
              
              {currentStep !== 'auto-bill' && currentStep !== 'custom-schedule' && (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="ml-auto"
                >
                  {t('next')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default PaymentSchedule;