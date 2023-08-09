/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCountries } from '$app/common/hooks/useCountries';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';

export function CompanyDetails() {

    const company = useCurrentCompany();

    const countries = useCountries();

    const [t] = useTranslation();

    return (
        <div className='flex flex-col'>
            <Element leftSide={t('company_name')}>{company.settings.name}</Element>
            <Element leftSide={t('address1')}>{company.settings.address1}</Element>
            <Element leftSide={t('address2')}>{company.settings.address2}</Element>
            <Element leftSide={`${t('city')}/${t('postal_code')}`}>{`${company.settings.city} ${company.settings?.city.length > 1 ? ', ' : ''} ${company.settings.postal_code}`}</Element>
            <Element leftSide={t('state')}>{`${company.settings.state} ${company.settings?.state.length > 1 ? ', ' : ''}
                    ${countries.find((country) => country.id === company.settings?.country_id)?.name}`}
            </Element>
        </div>
    );
}