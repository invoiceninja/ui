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
import { Button, SelectField } from "$app/components/forms";
import { useHandleCurrentCompanyChangeProperty } from "$app/pages/settings/common/hooks/useHandleCurrentCompanyChange";

export function USRegions() {
    const [t] = useTranslation();
    const handleChange = useHandleCurrentCompanyChangeProperty();

    return (
        <>
            <Element leftSide={t('united_states')}>
                <div className="grid grid-cols-s2 gap-4">
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
                >
                    Show
                </Button>
                </div>
            </Element>
        </>
    );
}
