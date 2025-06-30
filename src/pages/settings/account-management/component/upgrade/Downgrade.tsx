
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DowngradeConfirmModal } from "./DowngradeConfirmModal";
import { ChangeDocuNinjaPlanModal } from "./ChangeDocuNinjaPlanModal";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { toast } from "$app/common/helpers/toast/toast";
import { endpoint } from "$app/common/helpers";
import { request } from '$app/common/helpers/request';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';

interface Props {
    docuninja_num_users?: number;
}

export function Downgrade({ docuninja_num_users = 0 }: Props) {

    const { t } = useTranslation();
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showChangeDocuNinjaModal, setShowChangeDocuNinjaModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const account = useCurrentAccount();
    const refresh = useRefreshCompanyUsers();

    async function handleDowngradeConfirm() {
        setIsLoading(true);
        
        try {
            await request('POST', endpoint('/api/client/account_management/free'));
            
            toast.success();
            refresh();
            setShowDowngradeModal(false);
        } catch (error) {
            console.error('Downgrade failed:', error);
            toast.error();
        } finally {
            setIsLoading(false);
        }
    }
    
    async function handleDocuNinjaChange(newUserCount: number) {
        setIsLoading(true);
        
        try {
            await request('POST', endpoint('/api/client/account_management/docuninja/downgrade'), {
                num_users: newUserCount
            });
            
            toast.success();
            refresh();
            setShowChangeDocuNinjaModal(false);
        } catch (error) {
            console.error('DocuNinja plan change failed:', error);
            toast.error();
        } finally {
            setIsLoading(false);
        }
    }

    return (
    <div className="space-y-2">
        
        <div className="mt-4">
            <div className="flex flex-col items-center  ">
                <h4 className="text-lg font-semibold">{t('downgrade')}</h4>
            </div>

            <div className="flex flex-row items-center justify-center mt-4 gap-6">

                <button
                    type="button"
                    className="bg-red-500 p-4 rounded-md text-center hover:bg-red-900 transition duration-150 cursor-pointer"
                    onClick={() => setShowDowngradeModal(true)}
                >
                    <p className="text-white hover:text-red-600">{t('downgrade_to_free')}</p>
                </button>

                {account?.docuninja_num_users >= 1 && (
                    <button
                        type="button"
                        className="bg-red-500 p-4 rounded-md text-center hover:bg-red-900 transition duration-150 cursor-pointer"
                        onClick={() => setShowChangeDocuNinjaModal(true)}
                    >
                        <p className="text-white hover:text-red-600">{t('change_docuninja_plan')}</p>
                    </button>
                )}
            </div>
            <div className="flex flex-col text-center justify-between">
                <p className="text-sm">Need help? Please use the in app message feature to raise a support request.</p>
            </div>
        </div>

        {/* Modals */}
        <DowngradeConfirmModal
            visible={showDowngradeModal}
            onClose={() => setShowDowngradeModal(false)}
            onConfirm={handleDowngradeConfirm}
            isLoading={isLoading}
        />

        <ChangeDocuNinjaPlanModal
            visible={showChangeDocuNinjaModal}
            onClose={() => setShowChangeDocuNinjaModal(false)}
            onConfirm={handleDocuNinjaChange}
            currentUserCount={account?.docuninja_num_users || 0}
            isLoading={isLoading}
        />
        
    </div>
    )
}