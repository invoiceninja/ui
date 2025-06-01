import { useTitle } from "$app/common/hooks/useTitle";
import { Default } from "$app/components/layouts/Default";
import { useTranslation } from "react-i18next";
import { Button } from '$app/components/forms';
import { endpoint } from "$app/common/helpers";
import { request } from "$app/common/helpers/request";
import { useState } from "react";
import { Alert } from "$app/components/Alert";
import { Company } from "$app/common/interfaces/docuninja/api";
import { usePaidOrSelfHost } from "$app/common/hooks/usePaidOrSelfhost";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { UpgradeModal } from "../components/UpgradeModal";
import { useCurrentCompany } from "$app/common/hooks/useCurrentCompany";
import { useQueryClient } from "react-query";
import { useLogin } from "$app/common/queries/docuninja";

export default function Documents() {
    const { documentTitle } = useTitle('documents');
    const [t] = useTranslation();
    const queryClient = useQueryClient();

    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const account = useCurrentAccount();
    const company = useCurrentCompany();
    const pages = [{ name: t('documents'), href: '/documents' }];

    // Only check login status if user has a pro plan and company exists
    const shouldCheckLogin = account?.plan === 'pro' && !!company?.company_key;
    const { data: loginResponse, isLoading, error: loginError } = useLogin(shouldCheckLogin);
    const docuData = loginResponse?.data?.data;

    // Check if the error is a 401 (no account exists)
    const is401Error = loginError && (loginError as any)?.response?.status === 401;
    const hasAccount = !!docuData && !is401Error;
    const needsAccountCreation = is401Error;

    // Handle non-401 errors
    if (loginError && !is401Error && !error) {
        setError('Failed to fetch Docuninja data');
    }

    const docuAccount = docuData?.account;
    const docuCompany = docuData?.companies?.find((c: Company) => c.ninja_company_key === company?.company_key);
    const isPaidUser = docuAccount?.plan !== 'free' && new Date(docuAccount?.plan_expires ?? '') > new Date();

    /**Creates a new account in Docuninja */
    function create() {
        console.log('Create function called - making request to /api/docuninja/create');
        setError(null);
        setIsCreating(true);

        request('POST', endpoint('/api/docuninja/create'), {}, { skipIntercept: true })
            .then((response) => {
                console.log('Create request successful:', response);
                queryClient.invalidateQueries(['/api/docuninja/login']);
            })
            .catch((error) => {
                setError(error.response.data.error ?? 'Failed to create Docuninja account');
            })
            .finally(() => {
                setIsCreating(false);
            });
    }

    const hasPaidNinjaPlan = usePaidOrSelfHost();
    const navigate = useNavigate();

    function renderContent() {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center p-6">
                    <span className="text-gray-600">{t('loading')}...</span>
                </div>
            );
        }

        if (account.plan !== 'pro') {
            return (
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-gray-600 mb-4">Upgrade to a paid plan to access Docuninja</p>
                    <Button onClick={() => navigate('/settings/account_management')} behavior="button">
                        {t('upgrade_plan')}
                    </Button>
                </div>
            );
        }

        if (needsAccountCreation) {
            return (
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-gray-600 mb-4">Welcome to DocuNinja!</p>
                    <p className="text-gray-600 mb-4">To create your DocuNinja account for this company, please click the button below.</p>
                    <Button onClick={() => create()} disabled={isCreating || isLoading} behavior="button">
                        {t('create')}
                    </Button>
                </div>
            );
        }

        if (hasAccount && !docuCompany) {
            return (
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-gray-600 mb-4">Welcome to DocuNinja!</p>
                    <p className="text-gray-600 mb-4">Your account exists but this company is not set up yet. Please click the button below to set it up.</p>
                    <Button onClick={() => create()} disabled={isCreating || isLoading} behavior="button">
                        {t('setup_company')}
                    </Button>
                </div>
            );
        }

        if (docuCompany) {
            return (
                <div className="space-y-6">
                    {!isPaidUser || account.trial_days_left == 0 && (
                        <Alert type="warning" className="mb-4">
                            <div className="flex justify-between items-center">
                                <span>{t('upgrade_account_message')}</span>
                                <Button onClick={() => setShowUpgradeModal(true)} behavior="button">
                                    {t('upgrade_now')}
                                </Button>
                            </div>
                        </Alert>
                    )}

                    <UpgradeModal 
                        visible={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        onPaymentComplete={() => {
                            queryClient.invalidateQueries(['/api/docuninja/login']);
                            setShowUpgradeModal(false);
                        }}
                    />

                    <div className="bg-white rounded shadow overflow-hidden">
                        <div className="p-4">
                            <h2 className="text-lg font-medium">{t('your_documents')}</h2>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">
            {error && (
                <Alert type="danger" className="mb-4">
                    {error}
                </Alert>
            )}
            
            {renderContent()}
        </Default>
    );
}