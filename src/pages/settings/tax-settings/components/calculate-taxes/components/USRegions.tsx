/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from "react-i18next";
import { Element } from '$app/components/cards';
import { Button, Checkbox, Link, SelectField } from "$app/components/forms";
import { useHandleCurrentCompanyChangeProperty } from "$app/pages/settings/common/hooks/useHandleCurrentCompanyChange";
import { ChangeEvent, useState } from "react";
import { useCompanyChanges } from "$app/common/hooks/useCompanyChanges";
import { TaxSetting } from "$app/common/interfaces/company.interface";
import { TaxSettings } from "../../../TaxSettings";

export function USRegions() {
    const [t] = useTranslation();
    const handleChange = useHandleCurrentCompanyChangeProperty();

    const [isOpen, setIsOpen] = useState(false);
    const companyChanges = useCompanyChanges();
    
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

 
            
                Object.keys(companyChanges.tax_data.regions.US.subregions) as (keyof typeof companyChanges.tax_data.regions.US.subregions)[]).forEach((key, index) => {


                    console.log(key, companyChanges.tax_data.regions.US.subregions[key], index)
                
                    }
                

            )}
        </>
    );
}
