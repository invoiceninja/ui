import { useTitle } from "$app/common/hooks/useTitle";
import { Default } from "$app/components/layouts/Default";
import { useTranslation } from "react-i18next";
import { Button } from '$app/components/forms';
import { endpoint } from "$app/common/helpers";
import { request } from "$app/common/helpers/request";
import { useState } from "react";
import { Alert } from "$app/components/Alert";
import { User, Account, Company } from "$app/common/interfaces/docuninja/api";
import { usePaidOrSelfHost } from "$app/common/hooks/usePaidOrSelfhost";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { UpgradeModal } from "../components/UpgradeModal";
import { useCurrentCompany } from "$app/common/hooks/useCurrentCompany";
import { useQuery, useQueryClient } from "react-query";

export default function Documents() {
    const { documentTitle } = useTitle('documents');
    const [t] = useTranslation();
    const queryClient = useQueryClient();

    const [error, setError] = useState<string | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const account = useCurrentAccount();
    const company = useCurrentCompany();
    const pages = [{ name: t('documents'), href: '/documents' }];

    const { data: docuData, isLoading } = useQuery(
        ['/api/docuninja/login'],
        async () => {
            const response = await request('POST', endpoint('/api/docuninja/login'), {}, { skipIntercept: true });
            return response.data?.data;
        },
        {
            onError: (err) => {
                console.error('Error fetching Docuninja data:', err);
                setError('Failed to fetch Docuninja data');
            },
            enabled: !!company?.company_key,
        }
    );

    const user = docuData;
    const docuAccount = docuData?.account;
    const docuCompany = docuData?.companies?.find((c: Company) => c.ninja_company_key === company?.company_key);
    const isPaidUser = docuAccount?.plan !== 'free' && new Date(docuAccount?.plan_expires ?? '') > new Date();
    const testLogin = !!docuData;

    /**Creates a new account in Docuninja */
    function create() {
        setError(null);

        request('POST', endpoint('/api/docuninja/create'), {}, { skipIntercept: true })
            .then((response) => {
                // After creating, invalidate the query to trigger a refresh
                queryClient.invalidateQueries(['/api/docuninja/login']);
            })
            .catch(() => {
                setError('Failed to create Docuninja account');
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
                    <Button onClick={() => navigate('/settings/account_management')}>
                        {t('upgrade_plan')}
                    </Button>
                </div>
            );
        }

        if (testLogin && !docuCompany) {
            return (
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-gray-600 mb-4">Welcome to DocuNinja!</p>
                    <p className="text-gray-600 mb-4">To create your DocuNinja account for this company, please click the button below.</p>
                    <Button onClick={create} disabled={isLoading}>
                        {t('create')}
                    </Button>
                </div>
            );
        }

        if (docuCompany) {
            return (
                <div className="space-y-6">
                    {!isPaidUser && (
                        <Alert type="warning" className="mb-4">
                            <div className="flex justify-between items-center">
                                <span>{t('upgrade_account_message')}</span>
                                <Button onClick={() => setShowUpgradeModal(true)}>
                                    {t('upgrade_now')}
                                </Button>
                            </div>
                        </Alert>
                    )}

                    <UpgradeModal 
                        visible={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        upgradeableUsers={account?.num_users ?? 1}
                        currentSeats={docuAccount.plan === 'free' ? 0 : docuAccount?.seats ?? 1}
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