/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from "$app/common/hooks/useCompanyChanges";
import { USStateSelector } from "$app/components/USStateSelector";
import { useHandleCurrentCompanyChangeProperty } from "$app/pages/settings/common/hooks/useHandleCurrentCompanyChange";
import { useTranslation } from "react-i18next";
import { Element } from '$app/components/cards';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';


export function SellerSubregion() {
    const [t] = useTranslation();
    const companyChanges = useCompanyChanges();
    const handleChange = useHandleCurrentCompanyChangeProperty();
    const resolveCountry = useResolveCountry();

    return (
        <>
            <Element leftSide={t('seller_subregion')}>
                {resolveCountry(companyChanges?.settings.country_id)?.iso_3166_2 === 'US' ? (
                    <USStateSelector
                        value={companyChanges.tax_data?.seller_subregion}
                        onChange={(value) => handleChange('tax_data.seller_subregion', value)}
                    />


                ) : ''
                }
            </Element>
        </>
    );
}
