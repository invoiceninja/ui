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
import { TaxSetting } from "$app/common/interfaces/company.interface";
import { Element } from '$app/components/cards';
import { Button, SelectField } from "$app/components/forms";
import { useHandleCurrentCompanyChangeProperty } from "$app/pages/settings/common/hooks/useHandleCurrentCompanyChange";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

export function USRegions() {
    const [t] = useTranslation();
    const handleChange = useHandleCurrentCompanyChangeProperty();
    const companyChanges = useCompanyChanges();

    const [isOpen, setIsOpen] = useState(false);

    const usRegions: Array<[string, TaxSetting]> = Object.entries(companyChanges.tax_data.regions.US.subregions);

    return (
        <>
            <Element leftSide={t('united_states')}>
                <div className="grid grid-cols-2 gap-4">
                    <SelectField
                        id="tax_data.regions.US.tax_all_subregions"
                        className="col-auto"
                        onValueChange={(value) => handleChange('tax_data.regions.US.tax_all_subregions', Boolean(value))}
                    >
                        <option value="true">{t('tax_all')}</option>
                        <option value="false">{t('tax_selected')}</option>
                    </SelectField>
                
                    <Button
                        type="primary"
                        className="col-auto"
                        onClick={(e: ChangeEvent<HTMLInputElement>) => {
                            e.preventDefault();
                            setIsOpen((isOpen) => !isOpen)
                        }}
                    >
                        Show
                    </Button>
                    
                </div>
            </Element>
            {isOpen && (

                usRegions?.map((value, index) => (
                    <Element leftSide={value[0]} key={index}>

                    <div key={index}>
                            {value[1].tax_name} {value[1].tax_rate}%
                    </div>  
                    </Element>

                ))

                
            )}
        </>
    );
}
