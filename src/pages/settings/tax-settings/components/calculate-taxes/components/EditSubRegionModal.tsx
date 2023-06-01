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
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TaxSetting } from '$app/common/interfaces/company.interface';
import { Input } from 'postcss';

interface Props {
    region: string;
    subregion: string;
    tax_setting: TaxSetting;
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

export function EditSubRegionModal(props: Props) {
    const [t] = useTranslation();
    
    const {
        visible,
        setVisible,
        region,
        subregion,
        tax_setting,
    } = props;

    const handleChangeRuleField = (value: string) => {

    };
    
    const handleAddRule = (value: string) => {

    };

    

    return (
        <Modal
            title="edit"
            visible={visible}
            onClose={() => setVisible(false)}
        >
            <InputField
                required
                label={t('field')}
                value={tax_setting.tax_name}
                onValueChange={(value) => handleChangeRuleField(value)}
            >

            </InputField>

            <Button
                className="self-end"
                onClick={handleAddRule}
                disableWithoutIcon
            >
                {t('save')}
            </Button>
        </Modal>
    );
}
