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
import { Button, Checkbox, SelectField } from "$app/components/forms";
import { useHandleCurrentCompanyChangeProperty } from "$app/pages/settings/common/hooks/useHandleCurrentCompanyChange";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditSubRegionModal } from "./EditSubRegionModal";

export function USRegions() {
    const [t] = useTranslation();
    const handleChange = useHandleCurrentCompanyChangeProperty();
    const companyChanges = useCompanyChanges();

    const [isOpen, setIsOpen] = useState(false);
    const [isEditSubregionModalOpen, setIsEditSubregionModalOpen] = useState<boolean>(false);
    
    const usRegions: Array<[string, TaxSetting]> = Object.entries(companyChanges.tax_data.regions.US.subregions);
    const [taxSetting, setTaxSetting] = useState<TaxSetting>([]);

    const isChecked = (apply_tax: string | boolean) => {
        return Boolean(apply_tax);
    };

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
                
                usRegions?.map((value: [string, TaxSetting], index) => (
                    
                    <div className="py-4 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-10 flex flex-col lg:flex-row undefined px-5 sm:px-6 lg:items-center" key={index}>

                        <div className="flex col-span-1 items-center justify-start pl-5">
                            <Checkbox
                                id={`tax_data.regions.US.subregions.${value[0]}`}
                                value={`tax_data.regions.US.subregions.${value[0]}.apply_tax`}
                                className="flex justify-end h-6 w-6 rounded-half shadow"
                                onValueChange={(value, checked) =>
                                    
                                    handleChange(
                                        value,
                                        checked,
                                    )
                                    
                                }                           
                            ></Checkbox>

                            <div className="">
                                {value[0]}
                            </div>
                        </div>

                        <div className="">
                                {value[1].tax_name} {value[1].tax_rate}%
                        </div>  
                    
                        <div className="">
                            <Button 
                                type="primary" 
                                className=""
                                onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                    e.preventDefault();
                                    setTaxSetting(value[1]);
                                    setIsEditSubregionModalOpen(true)
                                }}
                            >
                                {t('edit')}
                            </Button>
                        </div>
                    </div>
                ))

            )}


            <EditSubRegionModal
                visible={isEditSubregionModalOpen}
                setVisible={setIsEditSubregionModalOpen}
                region="US"
                subregion="AL"
                taxSetting={taxSetting}
            />

        </>
    );
}
