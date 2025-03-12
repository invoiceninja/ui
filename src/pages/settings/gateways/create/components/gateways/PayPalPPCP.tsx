/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { Gateway } from '$app/common/interfaces/statics';
import { useResolveConfigValue } from '../../hooks/useResolveConfigValue';
import { formatLabel } from '../../helpers/format-label';
import { useResolveInputField } from '../../hooks/useResolveInputField';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
    gateway: Gateway;
    companyGateway: CompanyGateway;
    setCompanyGateway: React.Dispatch<
        React.SetStateAction<CompanyGateway | undefined>
    >;
    errors: ValidationBag | undefined;

}

export function PayPalPPCP(props: Props) {
    const [t] = useTranslation();

    const handleSetup = () => {
        request('POST', endpoint('/api/v1/one_time_token'), {
            context: 'paypal_ppcp',
        }).then((response) =>
            window
                .open(
                    route('https://invoicing.co/paypal?hash=:hash', {
                        hash: response.data.hash,
                    }),
                    '_blank'
                )
                ?.focus()
        );
    };

    const resolveConfigValue = useResolveConfigValue(props.companyGateway);


    const resolveInputField = useResolveInputField(
        props.companyGateway,
        props.setCompanyGateway
    );

    
    const merchantStatus = () => {
        const status = resolveConfigValue('status');
        const merchantId = resolveConfigValue('merchantId');

        return (status === 'activated' && merchantId);
    };

    const merchantOnboarding = () => {
        const merchantId = resolveConfigValue('merchantId');

        return merchantId.length > 0;

    };

    return (
        <>
        {/* {props.companyGateway && merchantStatus() && ( */}

            <Element leftSide={t('status')}>
                <ul className="list-none">
                    <li><b>Merchant id:</b> {resolveConfigValue('merchantId')}</li>
                    <li><b>{t('status')}:</b> {resolveConfigValue('status')}</li>
                    <li><b>{t('email')}:</b> {resolveConfigValue('emailVerified')}</li>
                    <li><b>{t('permissions')}:</b> {resolveConfigValue('permissions')}</li>
                    <li><b>{t('notifications')}:</b> {resolveConfigValue('returnMessage')}</li>
                </ul>
            </Element>
        {/* )} */}

        {props.companyGateway && !merchantStatus() && (
        <Element>
            <Button onClick={handleSetup} type="minimal" behavior="button">
                {t('gateway_setup')}
            </Button>
        </Element>
        )}

        {props.gateway && merchantOnboarding() &&
            Object.keys(JSON.parse(props.gateway.fields)).map((field, index) => (
                <Element leftSide={formatLabel(field)} key={index}>
                    {resolveInputField(
                        field,
                        JSON.parse(props.gateway.fields)[field],
                        props.errors
                    )}
                </Element>
            ))}
        </>
    );
    
}

