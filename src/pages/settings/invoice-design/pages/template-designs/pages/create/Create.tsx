/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { Design } from '$app/common/interfaces/design';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankDesignQuery } from '$app/common/queries/designs';
import { Container } from '$app/components/Container';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export default function Create() {
    const { t } = useTranslation();
    const { data } = useBlankDesignQuery();

    const queryClient = useQueryClient();

    const [design, setDesign] = useState<Design | null>(null);
    const [errors, setErrors] = useState<ValidationBag | null>(null);

    const handleChange = <T extends keyof Design>(key: T, value: Design[T]) => {
        setDesign((current) => current && {
            ...current,
            is_template: true,
            design: {
                    ...current.design,
                    header: " ",
                    body: "<ninja></ninja>",
                    footer: " ",
                    includes: " ",
                },
                [key]: value
            }
        );
    };

    useEffect(() => {
        if (data) {
            setDesign(data);
        }

        return () => setDesign(null);
    }, [data]);

    const navigate = useNavigate();

    useSaveBtn(
        {
            onClick() {
                toast.processing();
                setErrors(null);

                request('POST', endpoint('/api/v1/designs'), design)
                    .then((response: GenericSingleResourceResponse<Design>) => {
                        toast.success('design_created');

                        queryClient.invalidateQueries(['/api/v1/designs']);

                        navigate(
                            route('/settings/invoice_design/template_designs/:id/edit', {
                                id: response.data.data.id,
                            })
                        );
                    })
                    .catch((e: AxiosError<ValidationBag>) => {
                        if (e.response?.status === 422) {
                            toast.dismiss();
                            setErrors(e.response.data);
                        }
                    });
            },
        },
        [design]
    );

    return (
        <Container>
            <Card title={t('new_design')}>
                <Element leftSide={t('name')}>
                    <InputField
                        value={design?.name}
                        errorMessage={errors?.errors.name}
                        onValueChange={(value) => handleChange('name', value)}
                    />
                </Element>
            </Card>
        </Container>
    );
}
