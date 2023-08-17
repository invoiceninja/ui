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
import { useTranslation } from 'react-i18next';

import { TaxData } from '$app/common/interfaces/company.interface';

interface Props {
    entity: TaxData
}

export function EntityTaxData(props: Props) {

    const [t] = useTranslation();

    const formatTaxRate = (rate: number) => {
        return rate * 100 === 0 ? '0%' : `${(rate * 100).toFixed(3)}%`;
    };

    return (
        <div>
            <Element
                leftSide={t('state')}
                className="whitespace-nowrap"
            >
                {props.entity.geoState}
            </Element>
            <Element
                leftSide={t('county')}
                className="whitespace-nowrap"
            >
                {props.entity.geoCounty}
            </Element>
            <Element
                leftSide={t('city')}
                className="whitespace-nowrap"
            >
                {props.entity.geoCity}
            </Element>
            <Element
                leftSide={t('postal_code')}
                className="whitespace-nowrap"
            >
                {props.entity.geoPostalCode}
            </Element>
            <Element
                leftSide="State Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(props.entity.stateSalesTax)}
            </Element>
            <Element
                leftSide="County Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(props.entity.countySalesTax)}
            </Element>
            <Element
                leftSide="City Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(props.entity.citySalesTax)}
            </Element>
            <Element
                leftSide="District Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(props.entity.districtSalesTax)}
            </Element>
            <Element
                leftSide="Total Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(props.entity.taxSales)}
            </Element>
            <Element
                leftSide="Tax Location"
                className="whitespace-nowrap"
            >
                {props.entity.originDestination === 'D' ? 'Destination' : 'Origin'}
            </Element>
            <Element
                leftSide="Tax on services"
                className="whitespace-nowrap"
            >
                {props.entity.txbService === 'Y' ? 'Yes' : 'No'}
            </Element>
            <Element
                leftSide="Tax on freight"
                className="whitespace-nowrap"
            >
                {props.entity.txbFreight === 'Y' ? 'Yes' : 'No'}
            </Element>
        </div>
    );
}