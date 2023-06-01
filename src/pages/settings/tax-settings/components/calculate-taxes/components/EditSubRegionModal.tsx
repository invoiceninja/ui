/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { TaxSetting } from '$app/common/interfaces/company.interface';
import { useHandleCurrentCompanyChange } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';

interface Props {
    region: string;
    subregion: string;
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    taxSetting: TaxSetting;
}

export function EditSubRegionModal(props: Props) {
    const [t] = useTranslation();
    
    const {
        visible,
        setVisible,
        region,
        subregion,
        taxSetting,
    } = props;

    const handleChange = useHandleCurrentCompanyChange();

    const closeModal = () => {
        setVisible(false);
    };

    return (
        <Modal
            title={`${region} - ${subregion}`}
            visible={visible}
            onClose={() => setVisible(false)}
        >
            <InputField
                id={`tax_data.regions.${region}.subregions.${subregion}.tax_name`}
                label={t('tax_name')}
                value={taxSetting.tax_name}
                onChange={handleChange}
            >
            </InputField>

            <InputField
                id={`tax_data.regions.${region}.subregions.${subregion}.tax_rate`}
                label={t('tax_rate')}
                value={taxSetting.tax_rate}
                onChange={handleChange}
            >
            </InputField>

            <InputField
                id={`tax_data.regions.${region}.subregions.${subregion}.reduced_tax_rate`}
                label={t('reduced_rate')}
                value={taxSetting.reduced_tax_rate}
                onChange={handleChange}
            >
            </InputField>

            <Button
                className="self-end"
                onClick={closeModal}
                disableWithoutIcon
            >
                {t('save')}
            </Button>
        </Modal>
    );
}
