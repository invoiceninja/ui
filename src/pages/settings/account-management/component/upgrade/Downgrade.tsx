
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DowngradeConfirmModal } from "./DowngradeConfirmModal";
import { ChangeDocuNinjaPlanModal } from "./ChangeDocuNinjaPlanModal";
import { useCurrentAccount } from "$app/common/hooks/useCurrentAccount";
import { toast } from "$app/common/helpers/toast/toast";
import { endpoint } from "$app/common/helpers";
import { request } from '$app/common/helpers/request';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { isAxiosError } from "axios";
import { ValidationBag } from "$app/common/interfaces/validation-bag";
import { extractValidationErrorMessage } from "./helpers";

interface Props {
    docuninja_num_users?: number;
}

export function Downgrade({ docuninja_num_users = 0 }: Props) {

    const { t } = useTranslation();
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showChangeDocuNinjaModal, setShowChangeDocuNinjaModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [docuNinjaError, setDocuNinjaError] = useState<string | null>(null);
    const account = useCurrentAccount();
    const refresh = useRefreshCompanyUsers();

    const openContactModal = () => {
        window.dispatchEvent(new CustomEvent('open-contact-modal'));
    };

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
        setDocuNinjaError(null);
        
        try {
            await request('POST', endpoint('/api/client/account_management/docuninja/downgrade'), {
                num_users: newUserCount
            });
            
            toast.success();
            refresh();
            setShowChangeDocuNinjaModal(false);
        } catch (error) {
            if (isAxiosError<ValidationBag>(error) && error.response?.status === 422) {
                setDocuNinjaError(
                    extractValidationErrorMessage(error.response.data, 'num_users') ||
                    (t('validation_errors') as string)
                );

                return;
            }

            console.error('DocuNinja plan change failed:', error);
            toast.error();
        } finally {
            setIsLoading(false);
        }
    }

    const handleOpenChangeDocuNinjaModal = () => {
        setDocuNinjaError(null);
        setShowChangeDocuNinjaModal(true);
    };

    const handleCloseChangeDocuNinjaModal = () => {
        setDocuNinjaError(null);
        setShowChangeDocuNinjaModal(false);
    };

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
                        onClick={handleOpenChangeDocuNinjaModal}
                    >
                        <p className="text-white hover:text-red-600">{t('change_docuninja_plan')}</p>
                    </button>
                )}
            </div>
            <div className="flex flex-col text-center justify-between mt-6">
                <button
                    type="button"
                    className="text-sm underline cursor-pointer hover:text-gray-600"
                    onClick={openContactModal}
                >
                    Need help? Please use the in app message feature to raise a support request.
                </button>
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
            onClose={handleCloseChangeDocuNinjaModal}
            onConfirm={handleDocuNinjaChange}
            currentUserCount={account?.docuninja_num_users || 0}
            isLoading={isLoading}
            error={docuNinjaError}
            onErrorClear={() => setDocuNinjaError(null)}
        />
        
    </div>
    )
}
