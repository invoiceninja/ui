/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Default } from 'components/layouts/Default';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function SystemLog() {
    const [t] = useTranslation();
    const pages = [{ name: t('system_logs'), href: '/system_logs' }];

    const account = useCurrentCompany();

    const onClick = () => {
        const toastId = toast.loading(t('processing'));

        request('PUT', endpoint('/api/v1/accounts/:id', { id: account.id }), {
            set_react_as_default_ap: false,
        })
            .then(() => (window.location.href = window.location.origin))
            .catch((error: AxiosError) => {
                console.error(error);

                error.response?.status === 400
                    ? toast.error(error.response.data.message, { id: toastId })
                    : toast.error(t('error_title'), { id: toastId });
            });
    };

    return (
        <Default
            title={t('system_logs')}
            breadcrumbs={pages}
        >

        </Default>
    );
}
