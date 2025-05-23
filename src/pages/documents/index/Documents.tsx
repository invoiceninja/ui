import { useTitle } from "$app/common/hooks/useTitle";
import { Default } from "$app/components/layouts/Default";
import { useTranslation } from "react-i18next";
import { Button } from '$app/components/forms';
import { ValidationBag } from "$app/common/interfaces/validation-bag";
import { toast } from "$app/common/helpers/toast/toast";
import { AxiosError } from "axios";
import { endpoint } from "$app/common/helpers";
import { request } from "$app/common/helpers/request";
import { useState } from "react";
import { Alert } from "$app/components/Alert";
import { User, Account } from "$app/common/interfaces/docuninja/api";
import { usePaidOrSelfHost } from "$app/common/hooks/usePaidOrSelfhost";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { UpgradeModal } from "../components/UpgradeModal";

export default function Documents() {
    const { documentTitle } = useTitle('documents');
    const [t] = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [docuAccount, setDocuAccount] = useState<Account | null>(null);
    const [testLogin, setTestLogin] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const account = useCurrentAccount();

    const pages = [{ name: t('documents'), href: '/documents' }];

    const isPaidUser = account?.plan !== 'free' && new Date(account?.plan_expires ?? '') > new Date();

    /**Tests if the user can login to Docuninja */
    function login() {
        setIsLoading(true);
        setError(null);

        request('POST', endpoint('/api/docuninja/login'), {})
            .then((response) => {
                console.log('Login response:', response.data);
                
                if (response.data.data) {
                    setUser(response.data.data);
                    setDocuAccount(response.data.data.account);
                    toast.success(t('successfully_logged_in') as string);
                } else {
                    setUser(null);
                    setDocuAccount(null);
                }
            })
            .catch((e: AxiosError<ValidationBag>) => {
                console.error('Login error:', e);
                setError(e.response?.data?.message || t('error_logging_in') as string);
                toast.error(t('error_logging_in') as string);
            })
            .finally(() => {
                console.log('Current state:', { user, account, isLoading });
                setIsLoading(false);
                setTestLogin(true);
            });
    }

    /**Creates a new account in Docuninja */
    function create() {
        setIsLoading(true);
        setError(null);

        request('POST', endpoint('/api/docuninja/create'), {})
            .then((response) => {
                
                setUser(response.data);
                setDocuAccount(response.data?.account);

                toast.success(t('account_created_successfully') as string);
            })
            .catch((e: AxiosError<ValidationBag>) => {
                setError(e.response?.data?.message || t('error_creating_account') as string);
                toast.error(t('error_creating_account') as string);
            })
            .finally(() => setIsLoading(false));
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


        /** First gate check if the user has a paid Invoice Ninjaplan */
        // if (!hasPaidNinjaPlan) { //@docuninja stubs
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

        // If we have a user but no account, show create account
        if (testLogin &&!docuAccount) {
            return (
                <div className="flex flex-col items-center gap-4 p-6">
                    <p className="text-gray-600 mb-4">{t('no_account_found')}</p>
                    <Button onClick={create} disabled={isLoading}>
                        {t('create_account')}
                    </Button>
                </div>
            );
        }

        // If we have an account, show the documents view
        if (docuAccount) {
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
                    />

                    {/* Add your table component here */}
                    <div className="bg-white rounded shadow overflow-hidden">
                        <div className="p-4">
                            <h2 className="text-lg font-medium">{t('your_documents')}</h2>
                            {/* Table implementation goes here */}
                        </div>
                    </div>
                </div>
            );
        }

        // Default state - show login
        return (
            <div className="flex flex-col items-center gap-4 p-6">
                <p className="text-gray-600 mb-4">{t('check_existing_account')}</p>
                <Button onClick={login} disabled={isLoading}>
                    {t('login')}
                </Button>
            </div>
        );
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