/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { Element } from './cards';
import { InputCustomField, Props } from './forms/InputCustomField';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { InputField } from './forms';

export function CustomSurchargeField(props: Props) {
    const [label, setLabel] = useState('');
    const company = useCurrentCompany();

    useEffect(() => {
        console.log(props);
        const [fieldLabel] = [company.custom_fields[props.field], ''];
        setLabel(fieldLabel || '');
    }, []);

    return (
        <Element leftSide={label}>
            <InputField {...props} />
        </Element>
    );
}
