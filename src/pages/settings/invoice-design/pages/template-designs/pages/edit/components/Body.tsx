/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { payloadAtom } from '../Edit';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'react-use';
import { Card, Element } from '$app/components/cards';
import Editor from '@monaco-editor/react';
import { useDesignUtilities } from '../common/hooks';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { InputField } from '$app/components/forms';
import { Divider } from '$app/components/cards/Divider';

interface Props {
    errors: ValidationBag | undefined;
}

export function Body(props: Props) {
    const [payload] = useAtom(payloadAtom);
    const [value, setValue] = useState(payload.design?.design.body);

    const { t } = useTranslation();
    const { handleBlockChange } = useDesignUtilities();
    const { errors } = props;
    const { handlePropertyChange } = useDesignUtilities();

    useDebounce(() => value && handleBlockChange('body', value), 1000, [value]);

    return (
        <Card title={t('template')} padding="small">
            <Element leftSide={t('name')}>
                <InputField
                    value={payload.design?.name}
                    onValueChange={(value) => handlePropertyChange('name', value)}
                    errorMessage={errors?.errors.name}
                />
            </Element>
            <Divider />
            <Editor
                height="100rem"
                defaultLanguage="html"
                value={payload.design?.design.body}
                options={{
                    minimap: {
                        enabled: false,
                    },
                }}
                onChange={(markup) => markup && setValue(markup)}
            />
        </Card>
    );
}
