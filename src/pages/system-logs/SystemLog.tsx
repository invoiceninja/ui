/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';

export function SystemLog() {
    const [t] = useTranslation();
    const pages = [{ name: t('system_logs'), href: '/system_logs' }];

    const company = useCurrentCompany();


    return (
        <Default
            title={t('system_logs')}
            breadcrumbs={pages}
        >

        </Default>
    );
}
