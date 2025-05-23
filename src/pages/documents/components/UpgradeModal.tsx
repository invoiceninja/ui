import { useEffect, useState } from 'react';
import { Modal } from '$app/components/Modal';
import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { PaymentMethodForm } from '$app/pages/settings/account-management/component/plan/PaymentMethodForm';
import { useCurrentAccount } from '$app/common/hooks/useCurrentAccount';
import { Button } from '$app/components/forms';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { useQuery } from 'react-query';

interface Props {
    visible: boolean;
    onClose: () => void;
    upgradeableUsers: number;
    onPaymentComplete: () => void;
    currentSeats?: number;
}

interface PricingResponse {
    description: string;
    price: string;
    pro_rata: string;
    pro_rata_raw: number;
}

export function UpgradeModal({ visible, onClose, upgradeableUsers, onPaymentComplete, currentSeats = 1 }: Props) {
    const [t] = useTranslation();
    const account = useCurrentAccount();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(currentSeats + 1);
    const [pricing, setPricing] = useState<PricingResponse | null>(null);
    const [showPayment, setShowPayment] = useState(false);

    const { data: methods } = useQuery({
        queryKey: ['/api/client/account_management/methods', account?.id],
        queryFn: () =>
            request('POST', endpoint('/api/client/account_management/methods'), {
                account_key: account?.key,
            }).then(
                (response: AxiosResponse<GenericManyResponse<CompanyGateway>>) =>
                    response.data.data
            ),
        enabled: Boolean(account),
    });

    // Generate options from current seats + 1 up to max seats
    const userOptions = Array.from(
        { length: upgradeableUsers - currentSeats }, 
        (_, i) => ({
            value: (currentSeats + i + 1).toString(),
            label: `${currentSeats + i + 1} ${t('users')}`,
        })
    );

    useEffect(() => {
        if (visible) {
            // Reset to first screen when modal opens
            setShowPayment(false);
            // Set initial selection to minimum available upgrade
            const initialSelection = currentSeats + 1;
            setSelectedUsers(initialSelection);
            fetchPricing(initialSelection);
        }
    }, [visible, currentSeats]);

    // Fetch pricing whenever selected users changes
    useEffect(() => {
        if (selectedUsers) {
            fetchPricing(selectedUsers);
        }
    }, [selectedUsers]);

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(event.target.value);
        setSelectedUsers(newValue);
    };

    const fetchPricing = (numUsers: number) => {
        setIsLoading(true);

        request('POST', endpoint('/api/client/account_management/docuninja/description'), {
            num_users: numUsers,
        })
            .then((response) => {

                setPricing(response.data);
            })
            .catch((error) => {
                console.error('Error fetching pricing:', error);
                toast.error(t('error_fetching_pricing') as string);
            })
            .finally(() => setIsLoading(false));
    };

    const handlePaymentSuccess = () => {
        toast.success(t('upgrade_successful') as string);
        onClose();
    };

    const handleContinueToPayment = () => {
        setShowPayment(true);
    };

    const handleCancel = () => {
        onClose();
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal
            title={showPayment ? t('complete_payment') : t('upgrade_docuninja')}
            visible={visible}
            onClose={onClose}
            size="large"
            disableClosing={true}
        >
            <div className="space-y-6">
                {!showPayment ? (
                    <>
                        {upgradeableUsers > 1 && (
                            <div>
                                <SelectField
                                    value={selectedUsers.toString()}
                                    onChange={handleUserChange}
                                    label={t('select_number_of_users')}
                                >
                                    {userOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>
                        )}

                        {pricing && !isLoading && (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded">
                                    <h3 className="font-medium">{pricing.description}</h3>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex justify-between">
                                            <span>{t('base_price')}:</span>
                                            <span className="font-medium">{pricing.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{t('pro_rata_amount')}:</span>
                                            <span className="font-medium">{pricing.pro_rata}</span>
                                        </div>
                                    </div>
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
                                    >
                                        {t('continue')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-center py-4">
                                <span className="text-gray-600">{t('loading')}...</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded mb-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">{t('payment_summary')}</h3>
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="text-sm text-primary hover:text-primary-dark"
                                >
                                    {t('change')}
                                </button>
                            </div>
                            <div className="mt-2">
                                <div className="flex justify-between text-sm">
                                    <span>{t('selected_users')}</span>
                                    <span>{selectedUsers}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium mt-1">
                                    <span>{t('total_amount')}</span>
                                    <span>{pricing?.pro_rata}</span>
                                </div>
                            </div>
                        </div>

                        <PaymentMethodForm
                            tokens={methods || []}
                            amount_string={pricing?.pro_rata}
                            amount_raw={pricing?.pro_rata_raw}
                            num_users={selectedUsers}
                            onPaymentSuccess={handlePaymentSuccess}
                            onCancel={handleCancel}
                            onPaymentComplete={onPaymentComplete}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
} 