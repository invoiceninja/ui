/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Button } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { Modal } from '$app/components/Modal';
import { SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';


interface Props {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyTaxDetails(props: Props) {
    const [t] = useTranslation();

    const company = useCurrentCompany();
    
    const formatTaxRate = (rate: number) => {

        return rate*100 === 0 ? '0%' : `${(rate * 100).toFixed(3)}%`;
    };

    return (
        <Modal
            title="Company Tax Configuration"
            visible={props.isModalOpen}
            onClose={() => props.setIsModalOpen(false)}
            backgroundColor="white"
        >
        {company.origin_tax_data?.geoPostalCode === undefined && (
            <div></div>
        )}
        {company.origin_tax_data?.geoPostalCode && (
        <div className="">
            <Element 
                leftSide={t('postal_code')}
                className="whitespace-nowrap"
            >
                {company.origin_tax_data.geoPostalCode}
            </Element>
            <Element
                leftSide={t('city')}
                className="whitespace-nowrap"
            >
                {company.origin_tax_data.geoCity}
            </Element>
            <Element
                leftSide={t('county')}
                className="whitespace-nowrap"
            >
                {company.origin_tax_data.geoCounty}
            </Element>
            <Element
                leftSide={t('state')}
                className="whitespace-nowrap"
            >
                {company.origin_tax_data.geoState}
            </Element>
            <Element
                leftSide="State Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(company.origin_tax_data.stateSalesTax)}
            </Element>
            <Element
                leftSide="City Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(company.origin_tax_data.citySalesTax)}
            </Element>
            <Element
                leftSide="City Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(company.origin_tax_data.countySalesTax)}
            </Element>
            <Element
                leftSide="Total Sales Tax"
                className="whitespace-nowrap"
            >
                {formatTaxRate(company.origin_tax_data.taxSales)}
            </Element>
            <Element
                leftSide="Tax Location"
                className="whitespace-nowrap"
            >
            {company.origin_tax_data.originDestination === 'D' ? 'Destination' : 'Origin'}
            </Element>
            <Element
                leftSide="Tax on services"
                className="whitespace-nowrap"
            >
                {company.origin_tax_data.txbService === 'Y' ? 'Yes' : 'No'}
            </Element>
            <Element
                leftSide="Tax on freight"
                className="whitespace-nowrap"
            >
                {company.origin_tax_data.txbFreight === 'Y' ? 'Yes' : 'No'}
            </Element>
        </div>
        )}
            <Button onClick={() => props.setIsModalOpen(false)}>{t('close')}</Button>

        </Modal>
    );
}