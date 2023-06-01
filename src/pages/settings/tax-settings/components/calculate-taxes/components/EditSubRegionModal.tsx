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

    const handleChangeRuleField = (value: string) => {

    };

    const handleUpdate = (value: string) => {

    };

    return (
        <Modal
            title={`${region} - ${subregion}`}
            visible={visible}
            onClose={() => setVisible(false)}
        >
            <InputField
                label={t('tax_name')}
                value={taxSetting.tax_name}
                onValueChange={(value) => handleChangeRuleField(value)}
            >
            </InputField>

            <InputField
                label={t('tax_rate')}
                value={taxSetting.tax_rate}
                onValueChange={(value) => handleChangeRuleField(value)}
            >
            </InputField>

            <InputField
                label={t('reduced_rate')}
                value={taxSetting.reduced_tax_rate}
                onValueChange={(value) => handleChangeRuleField(value)}
            >
            </InputField>

            <Button
                className="self-end"
                onClick={handleUpdate}
                disableWithoutIcon
            >
                {t('save')}
            </Button>
        </Modal>
    );
}
