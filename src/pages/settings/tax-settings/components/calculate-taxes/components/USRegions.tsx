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
import { useTranslation } from "react-i18next";
import { Card, Element } from '$app/components/cards';
import { Button, SelectField } from "$app/components/forms";
import { ChangeEvent } from "react";
import { useDispatch } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useCurrentCompany } from "$app/common/hooks/useCurrentCompany";

export function USRegions() {
    const [t] = useTranslation();
    const company = useCurrentCompany();

    // const handleChange = useHandleCurrentCompanyChangeProperty();
    const dispatch = useDispatch();
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch(
            updateChanges({
                object: 'company',
                property: event.target.id,
                value: event.target.value,
            })
        );
    };

    return (
        <>
            <Element leftSide={t('united_states')}>
                <div className="grid grid-cols-2 gap-4">
                <SelectField
                    id="tax_data.regions.US.tax_all_subregions"
                    className="col-auto"
                    value={company?.tax_data.regions.US.tax_all_subregions}
                    onChange={handleChange}
                >
                    <option value={true}>{t('tax_all')}</option>
                    <option value={false}>{t('tax_selected')}</option>
                </SelectField>
                
                <Button
                    type="primary"
                        className="col-auto"
                >
                    Show
                </Button>
                </div>
            </Element>
        </>
    );
}
