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

type PlanType = 'pro' | 'enterprise' | 'docuninja';

export function UpgradeModal({ visible, onClose, onPaymentComplete }: Props) {
    const [t] = useTranslation();
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMainPlan, setSelectedMainPlan] = useState<'pro' | 'enterprise' | null>(null);
    const [docuNinjaSelected, setDocuNinjaSelected] = useState(false);
    const [enterpriseUsers, setEnterpriseUsers] = useState(2);
    const [docuNinjaUsers, setDocuNinjaUsers] = useState(0);
    const [isYearly, setIsYearly] = useState(true);
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [currentStep, setCurrentStep] = useState<ModalStep>(ModalStep.PLAN_SELECTION);

    // Check if user already has a plan (pro or enterprise)
    const hasExistingPlan = account?.plan === 'pro' || account?.plan === 'enterprise';
    
    // DocuNinja is available if user has existing plan OR has selected a main plan
    const isDocuNinjaAvailable = hasExistingPlan || selectedMainPlan !== null;

    // Static map of all available enterprise tiers
    const ENTERPRISE_TIERS_MAP = {
        2: {
            value: 2,
            label: `1-2 ${t('users')}`,
            monthlyKey: 'enterprise_plan',
            yearlyKey: 'enterprise_plan_annual',
            minUsers: 1,
            maxUsers: 2
        },
        5: {
            value: 5,
            label: `3-5 ${t('users')}`,
            monthlyKey: 'enterprise_plan_5',
            yearlyKey: 'enterprise_plan_annual_5',
            minUsers: 3,
            maxUsers: 5
        },
        10: {
            value: 10,
            label: `6-10 ${t('users')}`,
            monthlyKey: 'enterprise_plan_10',
            yearlyKey: 'enterprise_plan_annual_10',
            minUsers: 6,
            maxUsers: 10
        },
        20: {
            value: 20,
            label: `11-20 ${t('users')}`,
            monthlyKey: 'enterprise_plan_20',
            yearlyKey: 'enterprise_plan_annual_20',
            minUsers: 11,
            maxUsers: 20
        },
        30: {
            value: 30,
            label: `21-30 ${t('users')}`,
            monthlyKey: 'enterprise_plan_30',
            yearlyKey: 'enterprise_plan_annual_30',
            minUsers: 21,
            maxUsers: 30
        },
        50: {
            value: 50,
            label: `31-50 ${t('users')}`,
            monthlyKey: 'enterprise_plan_50',
            yearlyKey: 'enterprise_plan_annual_50',
            minUsers: 31,
            maxUsers: 50
        }
    };

    // Function to get filtered enterprise user options based on current user and criteria
    const getFilteredEnterpriseOptions = () => {
        const currentUserPlan = account?.plan;
        const currentUserCount = account?.num_users || 2;
        
        // Convert map to array
        const allTiers = Object.values(ENTERPRISE_TIERS_MAP);
        
        // Apply filters based on current user's plan
        let filteredTiers = allTiers;
        
        if (currentUserPlan === 'enterprise') {
            // Enterprise users can only upgrade to higher tiers
            filteredTiers = allTiers.filter(tier => tier.value > currentUserCount);
        }
        // Pro users and others can see all enterprise tiers
        
        // TODO: Add more filtering logic here as needed
        // Example filters you could add:
        // - Filter by region/country
        // - Filter by account type
        // - Filter by feature availability
        // - Filter by special promotions
        
        return filteredTiers;
    };

    // Generate enterprise user options from filtered tiers
    const enterpriseUserOptions = getFilteredEnterpriseOptions();

    // Helper function to get product key for a tier based on billing term
    const getProductKeyForTier = (tierValue: number, isYearly: boolean) => {
        const tier = ENTERPRISE_TIERS_MAP[tierValue as keyof typeof ENTERPRISE_TIERS_MAP];
        if (!tier) return null;
        return isYearly ? tier.yearlyKey : tier.monthlyKey;
    };

    // Helper function to get tier details by value
    const getTierDetails = (tierValue: number) => {
        return ENTERPRISE_TIERS_MAP[tierValue as keyof typeof ENTERPRISE_TIERS_MAP] || null;
    };

    // Generate DocuNinja user options based on selected plan and user's current plan
    const getDocuNinjaUserOptions = () => {
        if (docuNinjaSelected) {
            let maxUsers = 1; // Default for Pro plans
            
            if (selectedMainPlan === 'enterprise') {
                // New user or existing user upgrading to enterprise - use selected enterprise user count
                maxUsers = enterpriseUsers;
            } else if (selectedMainPlan === 'pro') {
                // Pro plan selected - only 1 user allowed
                maxUsers = 1;
            } else if (hasExistingPlan) {
                // Existing user with no main plan selected (adding DocuNinja only)
                maxUsers = account?.plan === 'enterprise' ? (account?.num_users || 2) : 1;
            }
            
            const options = Array.from(
                { length: maxUsers }, 
                (_, i) => ({
                    value: (i + 1).toString(),
                    label: `${i + 1} ${i === 0 ? t('user') : t('users')}`,
                })
            );
            
            return options;
        }
        
        return [];
    };

    const planOptions = [
        // Show regular upgrade options first
        ...(!hasExistingPlan || account?.plan !== 'enterprise' ? [{
            value: 'pro',
            label: t('pro'),
            description: t('pro_plan'),
            features: [
                t('unlimited_documents'),
                t('esignatures_at_checkout'),
                t('basic_customization')
            ]
        }] : []),
        {
            value: 'enterprise',
            label: t('enterprise'),
            description: t('enterprise_plan'),
            features: [
                t('unlimited_documents'),
                t('esignatures_at_checkout'),
                t('advanced_customization'),
                t('priority_support'),
                t('custom_integrations')
            ]
        },
        // Show DocuNinja-only option last (to the right) if user has existing plan
        ...(hasExistingPlan ? [{
            value: 'docuninja',
            label: 'DocuNinja',
            description: 'Add E-Signatures to your existing plan',
            features: [
                'Keep your current plan unchanged',
                'Add DocuNinja E-Signatures',
                'Works with your existing features',
                'Separate billing for DocuNinja'
            ]
        }] : [])
    ].filter(plan => {
        // If user is on enterprise, hide pro plan option (but keep DocuNinja and enterprise upgrade options)
        if (account?.plan === 'enterprise' && plan.value === 'pro') {
            return false;
        }
        return true;
    });

    // Add DocuNinja option for new users (always at the end)
    if (!hasExistingPlan) {
        planOptions.push({
            value: 'docuninja',
            label: 'DocuNinja',
            description: 'Add E-Signatures to your plan',
            features: [
                'E-Signature functionality',
                'Works with Pro or Enterprise',
                'Additional per-user billing',
                'Optional add-on service'
            ]
        });
    }

    useEffect(() => {
        if (visible) {
            // Reset to first step when modal opens
            setCurrentStep(ModalStep.PLAN_SELECTION);
            
            // Set initial selections based on user's current plan
            if (hasExistingPlan) {
                setSelectedMainPlan(null); // No main plan selection for existing users
                setDocuNinjaSelected(false);
                setDocuNinjaUsers(0);
            } else {
                setSelectedMainPlan(null);
                setDocuNinjaSelected(false);
                setDocuNinjaUsers(0);
            }

            if(account.plan == 'enterprise'){
                if(account.num_users == 2){
                    setEnterpriseUsers(5);
                }
                if(account.num_users == 5){
                    setEnterpriseUsers(10);
                }
                if(account.num_users == 10){
                    setEnterpriseUsers(20);
                }
                if(account.num_users == 20){
                    setEnterpriseUsers(30);
                }
                if(account.num_users == 30){
                    setEnterpriseUsers(50);
                }
            }

            if(account.plan === 'pro' && account.plan_term === 'month'){
                setIsYearly(true);
            }
            else
                setIsYearly(account.plan_term == 'year');
        }
    }, [visible, hasExistingPlan]);

    // Single effect to handle all pricing updates with debouncing
    useEffect(() => {
        if (!visible) return;
        
        // More strict condition - only fetch pricing when we actually have selections
        const hasMainPlanSelected = selectedMainPlan !== null;
        const hasDocuNinjaSelected = docuNinjaSelected && docuNinjaUsers > 0;
        const hasValidSelection = hasMainPlanSelected || hasDocuNinjaSelected;
        
        if (!hasValidSelection) {
            setPricing(null);
            return;
        }
        
        const timeoutId = setTimeout(() => {
            if (hasExistingPlan && docuNinjaSelected && !selectedMainPlan && docuNinjaUsers > 0) {
                // Existing user adding DocuNinja only - use their current plan
                fetchPricing(account?.plan as 'pro' | 'enterprise', account?.num_users || 1, docuNinjaUsers, isYearly);
            } else if (selectedMainPlan) {
                // User selecting main plan (with optional DocuNinja) - works for both new and existing users
                const effectiveDocuNinjaUsers = docuNinjaSelected ? docuNinjaUsers : 0;
                const effectiveUsers = selectedMainPlan === 'enterprise' ? enterpriseUsers : 1;
                fetchPricing(selectedMainPlan, effectiveUsers, effectiveDocuNinjaUsers, isYearly);
            }
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [visible, selectedMainPlan, docuNinjaSelected, enterpriseUsers, docuNinjaUsers, isYearly, hasExistingPlan]);

    const handlePlanToggle = (planValue: string) => {
        if (planValue === 'docuninja') {
            if (isDocuNinjaAvailable) {
                const newSelected = !docuNinjaSelected;
                setDocuNinjaSelected(newSelected);
                if (newSelected) {
                    setDocuNinjaUsers(1);
                } else {
                    setDocuNinjaUsers(0);
                }
            }
        } else {
            const planType = planValue as 'pro' | 'enterprise';
            if (selectedMainPlan === planType) {
                // Deselecting current plan
                setSelectedMainPlan(null);
                // Always deselect DocuNinja when main plan is deselected
                setDocuNinjaSelected(false);
                setDocuNinjaUsers(0);
            } else {
                // Selecting new plan
                setSelectedMainPlan(planType);
                // Reset DocuNinja users when changing main plan
                if (docuNinjaSelected && planType === 'pro') {
                    setDocuNinjaUsers(1); // Pro only allows 1 DocuNinja user
                }
            }
        }
    };

    const isPlanSelected = (planValue: string) => {
        if (planValue === 'docuninja') {
            return docuNinjaSelected;
        }
        return selectedMainPlan === planValue;
    };

    const isPlanDisabled = (planValue: string) => {
        if (planValue === 'docuninja') {
            return !isDocuNinjaAvailable;
        }
        return false;
    };

    const handleEnterpriseUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(event.target.value);
        setEnterpriseUsers(newValue);
        // If DocuNinja users exceed new enterprise users, reset it
        if (docuNinjaUsers > newValue) {
            setDocuNinjaUsers(newValue);
        }
    };

    const handleBillingToggle = () => {
        setIsYearly(!isYearly);
    };

    const handleBillingToggleDisabledState = () => {
        if (selectedMainPlan === 'pro' && account?.plan === 'pro' && account?.plan_term === 'month'){
            return true;
        }

        if (selectedMainPlan === 'enterprise' && account?.plan === 'pro' && account?.plan_term === 'year'){
            return true;
        }

        if (selectedMainPlan === 'enterprise' && account?.plan === 'pro' && account?.plan_term === 'month') {
            return false;
        }
        
        return false;
    };

    const fetchPricing = (plan: 'pro' | 'enterprise', users: number, docuNinjaUsers: number, yearly: boolean) => {
        setIsLoading(true);

        request('POST', endpoint('/api/client/account_management/v2/description'), {
            plan: plan,
            users: users,
            docuninja_users: docuNinjaUsers,
            term: yearly ? 'year' : 'month'
        })
            .then((response) => {
                setPricing(response.data);
            })
            .catch((error) => {
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

    const handleDocuNinjaUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(event.target.value);
        setDocuNinjaUsers(newValue);
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {planOptions.map((plan) => (
                                        <div
                                            key={plan.value}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                                isPlanSelected(plan.value)
                                                    ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                                    : isPlanDisabled(plan.value)
                                                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                                    : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 hover:shadow-sm'
                                            }`}
                                            onClick={() => !isPlanDisabled(plan.value) && handlePlanToggle(plan.value)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-lg font-semibold">{plan.label}</h4>
                                                {isPlanSelected(plan.value) && (
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {isPlanDisabled(plan.value) && !hasExistingPlan && (
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                                        Select a main plan first
                                                    </span>
                                                )}
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
                                                {plan.value === 'enterprise' && (
                                                    <li className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="max-w-xs" onClick={(e) => e.stopPropagation()}>
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

                                                {/* DocuNinja Users Selection (only for DocuNinja plan when selected) */}
                                                {(() => {
                                                    const isDocuNinjaPlan = plan.value === 'docuninja';
                                                    const shouldShowSelector = isDocuNinjaPlan && docuNinjaSelected;
                                                    
                                                    return shouldShowSelector ? (
                                                        <li className="mt-3 pt-3 border-t border-gray-200">
                                                            <div className="max-w-xs" onClick={(e) => e.stopPropagation()}>
                                                                <SelectField
                                                                    value={docuNinjaUsers.toString()}
                                                                    onChange={handleDocuNinjaUserChange}
                                                                    label="DocuNinja Users"
                                                                    disabled={selectedMainPlan === 'pro'}
                                                                >
                                                                    {getDocuNinjaUserOptions().map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </SelectField>
                                                            </div>
                                                            {hasExistingPlan && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Add DocuNinja E-Signatures to your existing {account?.plan?.toUpperCase()} plan
                                                                </p>
                                                            )}
                                                        </li>
                                                    ) : null;
                                                })()}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {account.plan_term !== 'year' && !docuNinjaSelected && (
                            <div className="flex flex-col items-center mt-6">
                                <div className="flex items-center space-x-2">
                                    <span>{t('plan_term_monthly')}</span>

                                    <Toggle
                                        checked={isYearly}
                                        onValueChange={handleBillingToggle}
                                        disabled={handleBillingToggleDisabledState()}
                                    />
                                    <span>{t('plan_term_yearly')} </span>
                                    
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{t('pay_annually_discount')}</p>
                            </div>
                            )}
                            
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
                                        <span className="capitalize">
                                            {hasExistingPlan && docuNinjaSelected && !selectedMainPlan
                                                ? `DocuNinja (${account?.plan} add-on)` 
                                                : selectedMainPlan || 'None selected'
                                            }
                                        </span>
                                    </div>
                                    {selectedMainPlan === 'enterprise' && (
                                        <div className="flex justify-between text-sm">
                                            <span>{t('enterprise_users')}:</span>
                                            <span>{enterpriseUsers}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span>{t('docuninja_users')}:</span>
                                        <span>{docuNinjaSelected ? docuNinjaUsers : 0}</span>
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
                                num_users={hasExistingPlan && !selectedMainPlan ? (account?.num_users || 1) : enterpriseUsers}
                                plan={hasExistingPlan && docuNinjaSelected && !selectedMainPlan ? 'docuninja' : (selectedMainPlan || 'pro')}
                                docuninja_users={docuNinjaSelected ? docuNinjaUsers : 0}
                                term={isYearly ? 'year' : 'month'}
                                amount_string={pricing?.pro_rata}
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
