import { useEffect, useState } from 'react';
import React from 'react';
import { Modal } from '$app/components/Modal';
import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { PaymentMethodForm } from '$app/pages/settings/account-management/component/plan/PaymentMethodForm';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { Button } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';

interface Props {
    visible: boolean;
    onClose: () => void;
    onPaymentComplete: () => void;
}

interface PricingResponse {
    description: string;
    price: string;
    pro_rata: string;
    pro_rata_raw: number;
    hash: string;
}

enum ModalStep {
    PLAN_SELECTION = 'plan_selection',
    PAYMENT = 'payment'
}

type PlanType = 'pro' | 'enterprise';

export function UpgradeModal({ visible, onClose, onPaymentComplete }: Props) {
    const [t] = useTranslation();
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('enterprise');
    const [enterpriseUsers, setEnterpriseUsers] = useState(2);
    const [docuNinjaUsers, setDocuNinjaUsers] = useState(0);
    const [docuNinjaEnabled, setDocuNinjaEnabled] = useState(false);
    const [isYearly, setIsYearly] = useState(true);
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [currentStep, setCurrentStep] = useState<ModalStep>(ModalStep.PLAN_SELECTION);

    // Generate enterprise user options from 1 to account.num_users
    const enterpriseUserOptions = [{
            value: 2,
            label: `1-2 ${t('users')}`,
        },
        {
            value: 5,
            label: `3-5 ${t('users')}`,
        },
        {
            value: 10,
            label: `6-10 ${t('users')}`,
        },
        {
            value: 20,
            label: `11-20 ${t('users')}`,
        },
        {
            value: 30,
            label: `21-30 ${t('users')}`,
        },
        {
            value: 50,
            label: `31-50 ${t('users')}`,
        }
    ];

    // Generate DocuNinja user options based on selected plan
    const getDocuNinjaUserOptions = () => {
        if (selectedPlan === 'pro') {
            return [{ value: '1', label: `1 ${t('user')}` }];
        } else {
            // For enterprise, 1 to selected enterprise users
            return Array.from(
                { length: enterpriseUsers }, 
                (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} ${t('users')}`,
                })
            );
        }
    };

    const planOptions = [
        { 
            value: 'pro', 
            label: t('pro'), 
            description: t('pro_plan_description'),
            features: [
                t('unlimited_documents'),
                t('esignatures_at_checkout'),
                t('basic_customization')
            ]
        },
        { 
            value: 'enterprise', 
            label: t('enterprise'), 
            description: t('enterprise_plan_description'),
            features: [
                t('unlimited_documents'),
                t('esignatures_at_checkout'),
                t('advanced_customization'),
                t('priority_support'),
                t('custom_integrations')
            ]
        }
    ];

    useEffect(() => {
        if (visible) {
            // Reset to first step when modal opens
            setCurrentStep(ModalStep.PLAN_SELECTION);
            // Set initial selections
            setSelectedPlan('enterprise');
            setEnterpriseUsers(2);
            setDocuNinjaUsers(0);
            setDocuNinjaEnabled(false);
            setIsYearly(true);
            // Don't fetch pricing here, let the main effect handle it
        }
    }, [visible]);

    // Single effect to handle all pricing updates with debouncing
    useEffect(() => {
        if (!visible || !selectedPlan || !enterpriseUsers) return;

        // Debounce the API call to prevent multiple rapid calls
        const timeoutId = setTimeout(() => {
            const effectiveDocuNinjaUsers = docuNinjaEnabled ? docuNinjaUsers : 0;
            fetchPricing(selectedPlan, enterpriseUsers, effectiveDocuNinjaUsers, isYearly);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [visible, selectedPlan, enterpriseUsers, docuNinjaUsers, docuNinjaEnabled, isYearly]);

    const handlePlanChange = (plan: PlanType) => {
        setSelectedPlan(plan);
        // Immediately reset DocuNinja settings when changing to Pro
        if (plan === 'pro') {
            setDocuNinjaUsers(0);
            setDocuNinjaEnabled(false);
        }
    };

    const handleEnterpriseUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(event.target.value);
        setEnterpriseUsers(newValue);
        // If DocuNinja users exceed new enterprise users, reset it
        if (docuNinjaUsers > newValue) {
            setDocuNinjaUsers(newValue);
        }
    };

    const handleDocuNinjaUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(event.target.value);
        setDocuNinjaUsers(newValue);
    };

    const handleBillingToggle = () => {
        setIsYearly(!isYearly);
    };

    const handleDocuNinjaToggle = () => {
        const newEnabled = !docuNinjaEnabled;
        setDocuNinjaEnabled(newEnabled);
        // Reset to 1 user when disabling DocuNinja
        if (!newEnabled) {
            setDocuNinjaUsers(0);
        }

        if (newEnabled && selectedPlan === 'pro') {
            setDocuNinjaUsers(1);
        }
    };

    const fetchPricing = (plan: PlanType, enterpriseUsers: number, docuNinjaUsers: number, yearly: boolean) => {
        setIsLoading(true);

        request('POST', endpoint('/api/client/account_management/v2/description'), {
            plan: plan,
            users: enterpriseUsers,
            docuninja_users: docuNinjaUsers,
            term: yearly ? 'year' : 'month'
        })
            .then((response) => {
                console.log(response.data);
                setPricing(response.data);
            })
            .catch((error) => {
                console.error('Error fetching pricing:', error);
                toast.error(t('error_fetching_pricing') as string);
            })
            .finally(() => setIsLoading(false));
    };

    const handleContinueToPayment = () => {
        if (!pricing) {
            toast.error(t('please_select_plan') as string);
            return;
        }
        setCurrentStep(ModalStep.PAYMENT);
    };

    const handleBackToPlanSelection = () => {
        setCurrentStep(ModalStep.PLAN_SELECTION);
    };

    const handlePaymentSuccess = () => {
        toast.success(t('upgrade_successful') as string);
        onPaymentComplete();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const getModalTitle = () => {
        switch (currentStep) {
            case ModalStep.PLAN_SELECTION:
                return t('select_docuninja_plan');
            case ModalStep.PAYMENT:
                return t('complete_payment');
            default:
                return t('select_docuninja_plan');
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal
            title={getModalTitle()}
            visible={visible}
            onClose={onClose}
            size="large"
            disableClosing={currentStep === ModalStep.PAYMENT}
        >
            <div className="space-y-6">
                {currentStep === ModalStep.PLAN_SELECTION && (
                    <>
                        {/* Step 1: Plan Selection */}
                        <div className="space-y-6">
                            {/* Plan Type Selection */}
                            <div>
                                <h3 className="text-lg font-medium mb-4">{t('choose_your_plan')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {planOptions.map((plan) => (
                                        <div
                                            key={plan.value}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                                                selectedPlan === plan.value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handlePlanChange(plan.value as PlanType)}
                                        >
                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="radio"
                                                    name="plan"
                                                    value={plan.value}
                                                    checked={selectedPlan === plan.value}
                                                    onChange={() => handlePlanChange(plan.value as PlanType)}
                                                    className="mr-3"
                                                />
                                                <h4 className="text-lg font-semibold">{plan.label}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                                            <ul className="text-sm space-y-1">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center">
                                                        <span className="text-green-500 mr-2">✓</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            
                                                {/* Enterprise Users Selection (only for Enterprise plan) */}
                                                {selectedPlan === 'enterprise' && plan.value === 'enterprise' && (
                                                    <li className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="max-w-xs">
                                                            <SelectField
                                                                value={enterpriseUsers.toString()}
                                                                onChange={handleEnterpriseUserChange}
                                                                label={t('number_of_enterprise_users')}
                                                            >
                                                                {enterpriseUserOptions.map((option) => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </SelectField>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {t('enterprise_users_description')}
                                                        </p>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center mt-6">
                                <div className="flex items-center space-x-2">
                                    <span>{t('plan_term_monthly')}</span>

                                    <Toggle
                                        checked={isYearly}
                                        onValueChange={handleBillingToggle}
                                    />
                                    <span>{t('plan_term_yearly')} </span>
                                    
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{t('pay_annually_discount')}</p>
                            </div>

                            {/* DocuNinja Users Selection */}
                            <div className="flex flex-rowspace-y-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="docuninja-enabled"
                                        checked={docuNinjaEnabled}
                                        onChange={handleDocuNinjaToggle}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="docuninja-enabled" className="flex-1">
                                        <div>
                                            <p className="font-medium">Want DocuNinja with that?</p>
                                            <p className="text-sm text-gray-600">Add in E Signatures with DocuNinja!</p>
                                        </div>
                                    </label>
                                </div>

                                {docuNinjaEnabled && (
                                    <div className="ml-7 space-y-2">
                                        <div className="max-w-xs">
                                            <SelectField
                                                value={docuNinjaUsers.toString()}
                                                onChange={handleDocuNinjaUserChange}
                                                label=''
                                                disabled={selectedPlan === 'pro'}
                                            >
                                                {getDocuNinjaUserOptions().map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>
                                        
                                    </div>
                                )}
                            </div>

                            {/* Pricing Display */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded">
                                    {pricing ? (
                                        <>
                                            <h3 className="font-medium">{pricing.description}</h3>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>{isYearly ? t('yearly_price') : t('monthly_price')}:</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{pricing.price}</span>
                                                        {isLoading && (
                                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>{t('total_amount')}:</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{pricing.pro_rata}</span>
                                                        {isLoading && (
                                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-center py-4">
                                            <span className="text-gray-600">{t('loading')}...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <Button 
                                        type="primary"
                                        behavior="button"
                                        onClick={handleContinueToPayment}
                                        disabled={!pricing || isLoading}
                                    >
                                        {t('continue_to_payment')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {currentStep === ModalStep.PAYMENT && (
                    <>
                        {/* Step 2: Payment */}
                        <div className="space-y-4">
                            {/* Order Summary */}
                            <div className="bg-gray-50 p-4 rounded mb-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">{t('order_summary')}</h3>
                                    <button
                                        onClick={handleBackToPlanSelection}
                                        className="text-sm text-primary hover:text-primary-dark"
                                    >
                                        {t('change')}
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{t('plan')}:</span>
                                        <span className="capitalize">{selectedPlan}</span>
                                    </div>
                                    {selectedPlan === 'enterprise' && (
                                        <div className="flex justify-between text-sm">
                                            <span>{t('enterprise_users')}:</span>
                                            <span>{enterpriseUsers}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span>{t('docuninja_users')}:</span>
                                        <span>{docuNinjaEnabled ? docuNinjaUsers : 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>{t('billing_term')}:</span>
                                        <span>{isYearly ? t('yearly') : t('monthly')}</span>
                                    </div>
                                    {pricing && (
                                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                                            <span>{t('total')}:</span>
                                            <span>{pricing.pro_rata}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Form */}
                            <PaymentMethodForm
                                tokens={[]}
                                num_users={enterpriseUsers}
                                plan={selectedPlan}
                                docuninja_users={docuNinjaUsers}
                                term={isYearly ? 'year' : 'month'}
                                amount_string={pricing?.price}
                                amount_raw={pricing?.pro_rata_raw}
                                hash={pricing?.hash}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentComplete={onPaymentComplete}
                                onCancel={handleBackToPlanSelection}
                            />
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
} 
