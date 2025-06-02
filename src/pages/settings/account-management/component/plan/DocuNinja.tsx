import { endpoint } from "$app/common/helpers";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { useCurrentCompany } from "$app/common/hooks/useCurrentCompany";
import { Company } from "$app/common/interfaces/docuninja/api";
import { Card } from "$app/components/cards";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { request } from "$app/common/helpers/request";
import { Plan } from "./Plan";
import { UpgradeModal } from "$app/pages/documents/components/UpgradeModal";
import { Button } from "$app/components/forms";
import { useState } from "react";
import { Check } from "react-feather";
import { useAccentColor } from "$app/common/hooks/useAccentColor";
import { useColorScheme } from "$app/common/colors";
import { useLogin } from "$app/common/queries/docuninja";
import { Alert } from "$app/components/Alert";

export function DocuNinja() {

    const accentColor = useAccentColor();
    const colors = useColorScheme();

    const account = useCurrentAccount();
    const { t } = useTranslation();
    const company = useCurrentCompany();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Only check login status if company exists
    const shouldCheckLogin = !!company?.company_key;
    const { data: loginResponse, isLoading } = useLogin(shouldCheckLogin);
    const docuData = loginResponse?.data?.data;

    function createDocuNinjaAccount() {
        setError(null);
        setIsCreating(true);
        
        request('POST', endpoint('/api/docuninja/create'), {}, { skipIntercept: true })
            .then((response) => {
                // After creating, invalidate the query to trigger a refresh
                queryClient.invalidateQueries(['/api/docuninja/login']);
            })
            .catch((error) => {
                setError(error.response.data.error ?? 'Failed to create Docuninja account');
            })
            .finally(() => {
                setIsCreating(false);
            });
    }

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const user = docuData;
    const docuAccount = docuData?.account;
    const docuCompany = docuData?.companies?.find((c: Company) => c.ninja_company_key === company?.company_key);
    const isPaidUser = docuAccount?.plan !== 'free' && new Date(docuAccount?.plan_expires ?? '') > new Date();
    const testLogin = !!docuData;
    
    console.log(docuAccount?.num_users, account.num_users);
    return (
        
        <Card>
            <div className="px-7 py-3 space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">{t('docuninja')}</h4>
                </div>
            
                {error && (
                    <Alert type="danger" className="mb-4">
                        {error}
                    </Alert>
                )}


                {docuAccount?.plan === 'pro' ? (
                    <div className="py-3 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold">Your Plan</h4>
                        </div>
                        <Plan
                            title={<p>
                                {t('enterprise')} ({docuAccount.num_users}{' '}
                                <span className="lowercase">{t('users')}</span>)
                            </p>}
                            color={"#000000"}
                            price={`${6*docuAccount.num_users}`}
                            trial={false}
                            custom={false}
                            term={docuAccount.plan_term === 'month' ? 'month' : 'year'}
                        />
                     </div>
                ) : null}


                {docuAccount?.plan === 'free' ? (
                    <div className="py-3 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold">Your Plan</h4>
                        </div>
                        <Plan
                            title={<p>
                                {t('free_trial')} ({docuAccount.num_users}{' '}
                                <span className="lowercase">{t('users')}</span>)
                            </p>}
                            color={"#000000"}
                            price={`${0 * docuAccount.num_users}`}
                            trial={false}
                            custom={false}
                            term={docuAccount.plan_term === 'month' ? 'month' : 'year'}
                        />
                    </div>
                ) : null}

                <div
                    className="rounded p-4 flex flex-col 2xl:flex-row justify-between items-center space-y-5 2xl:space-y-0"
                    style={{ backgroundColor: colors.$2 }}
                >
                    <div className="flex flex-col space-y-2">
                        <p className="font-semibold text-center 2xl:text-left">
                            Experience connected Document Management and Invoicing with DocuNinja!
                        </p>

                        <div className="grid grid-cols-2 gap-20 text-sm">
                            <div className="space-y-2">
                                <h3 className="font-semibold mb-3">Pro</h3>
                                <p className="flex items-center space-x-1">
                                    <Check size={18} style={{ color: accentColor }} />
                                    <span className="block">Create unlimited documents</span>
                                </p>
                                <p className="flex items-center space-x-1">
                                    <Check size={18} style={{ color: accentColor }} />
                                    <span className="block">Capture esignatures at checkout!</span>
                                </p>
                                <p className="flex items-center space-x-1">
                                    <Check size={18} style={{ color: accentColor }} />
                                    <span className="block">Advanced Customization</span>
                                </p>
                                <p className="flex items-center space-x-1">
                                    <Check size={18} style={{ color: accentColor }} />
                                    <span className="block">Embed signing links in documents</span>
                                </p>

                            </div>

                        </div>
                    </div>

                        
                        {!docuAccount && (
                            <div className="flex flex-col space-y-2 items-center">
                                
                                <p>Get started with DocuNinja!</p>

                                <Button 
                                    onClick={() => createDocuNinjaAccount()} 
                                    behavior="button"
                                    disabled={isCreating || isLoading}
                                >
                                    {t('create')}
                                </Button>

                            </div>
                        )}

                        {docuAccount?.num_users < account.num_users && (
                            <div className="flex flex-col space-y-2">
                                <Button onClick={() => setShowUpgradeModal(true)} behavior="button">
                                    {t('upgrade_now')}
                                </Button>

                                <UpgradeModal
                                    visible={showUpgradeModal}
                                    onClose={() => setShowUpgradeModal(false)}
                                    onPaymentComplete={() => {
                                        queryClient.invalidateQueries(['/api/docuninja/login']);
                                        setShowUpgradeModal(false);
                                    }}
                                />
                            </div>
                        )}





                </div>
            </div>
        </Card>
        
    
    );
}