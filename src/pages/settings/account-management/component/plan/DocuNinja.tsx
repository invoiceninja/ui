import { endpoint } from "$app/common/helpers";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { useCurrentCompany } from "$app/common/hooks/useCurrentCompany";
import { Company } from "$app/common/interfaces/docuninja/api";
import { Card } from "$app/components/cards";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "react-query";
import { request } from "$app/common/helpers/request";
import { Plan } from "./Plan";
import { UpgradeModal } from "$app/pages/documents/components/UpgradeModal";
import { Button } from "$app/components/forms";
import { useState } from "react";

export function DocuNinja() {

    const account = useCurrentAccount();
    const { t } = useTranslation();
    const company = useCurrentCompany();
    const queryClient = useQueryClient();
    const { data: docuData, isLoading } = useQuery(
        ['/api/docuninja/login'],
        async () => {
            const response = await request('POST', endpoint('/api/docuninja/login'), {}, { skipIntercept: true });
            return response.data?.data;
        },
        {
            onError: (err) => {
                console.error('Error fetching Docuninja data:', err);
            },
        }
    );

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const user = docuData;
    const docuAccount = docuData?.account;
    const docuCompany = docuData?.companies?.find((c: Company) => c.ninja_company_key === company?.company_key);
    const isPaidUser = docuAccount?.plan !== 'free' && new Date(docuAccount?.plan_expires ?? '') > new Date();
    const testLogin = !!docuData;
    
    console.log(account.num_users);
    return (
        <>
        <Card>
            <div className="px-7 py-3 space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">{t('docuninja')}</h4>
                </div>
            </div>

            <div className="px-7 py-3 space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Your Plan</h4>
                </div>
                    {docuAccount?.plan === 'pro' ? (
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
                    ) : null}

                    {docuAccount?.num_users < account.num_users && (
                        <>  
                        <Button onClick={() => setShowUpgradeModal(true)}>
                            {t('upgrade_now')}
                        </Button>

                        <UpgradeModal 
                        visible={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                        upgradeableUsers={account?.num_users ?? 1}
                        onPaymentComplete={() => {
                            queryClient.invalidateQueries(['/api/docuninja/login']);
                            setShowUpgradeModal(false);
                        }}
                    />
                    </>
                    )}
            </div>
        </Card>
    </>
    );
}