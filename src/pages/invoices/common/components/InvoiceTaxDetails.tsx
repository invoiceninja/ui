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
import { Modal } from '$app/components/Modal';
import { SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from 'antd';
import { ProductTableResource } from './ProductsTable';
import { Client } from '$app/common/interfaces/client';
import { Address } from '$app/pages/clients/show/components/Address';
import { Invoice } from '$app/common/interfaces/invoice';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { EntityTaxData } from '$app/pages/settings/tax-settings/components/calculate-taxes/EntityTaxData';

interface Props {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
    resource: Invoice | RecurringInvoice;
}

export function InvoiceTaxDetails(props: Props) {
    const [t] = useTranslation();

    const company = useCurrentCompany();
    const resolveCountry = useResolveCountry();

    const hasInvalidAddress = () => {
        return props.resource?.client?.postal_code === "" || props.resource?.client?.city === "" || props.resource?.client?.state === ""
    };

    return (
        <Modal
            title="Invoice Tax Details"
            visible={props.isModalOpen}
            onClose={() => props.setIsModalOpen(false)}
            backgroundColor="white"
            size="regular"
        >
            {props.resource.client && (
            <>
            <div className="col-span-12 lg:col-span-3">
                <p>{props.resource.client.display_name}</p>
                <p>
                    {props.resource.client.address1.length > 0 && props.resource.client.address1}
                    {props.resource.client.address1.length > 0 && <br />}
                    {props.resource.client.address2}
                </p>

                <p>
                    {props.resource.client.city.length > 0 && props.resource.client.city} &nbsp;
                    {props.resource.client.postal_code.length > 0 && props.resource.client.postal_code} &nbsp;
                    {props.resource.client.state}
                </p>

                <p>{resolveCountry(props.resource.client.country_id)?.name}</p>
            </div>
            </>
            )}

            <Divider />
            {props.resource.tax_info && (
                <div className="flex flex-col">
                    <EntityTaxData
                        entity={props.resource.tax_info}
                    />
                </div>
            )}
            {/* {props.resource.tax_info === undefined ||
                company.origin_tax_data?.geoPostalCode === "" ||
                hasInvalidAddress()
                && (
                    <div className='flex flex-col items-center '>
                        <p className="text-center">Minimum required fields are Zip, City, State. For highest accuracy, also include a valid street address.</p>
                        <Link
                            to="/settings/company_details/address"
                        >
                            <Button className='mt-5 mb-5'>Update Company Address</Button>
                        </Link>

                    </div>
                )}
            {company.origin_tax_data && !hasInvalidAddress() && (
                <div className="flex flex-col">
                    <EntityTaxData
                        entity={company.origin_tax_data}
                    />
                    <div className='flex justify-center items-center'>
                        <Button onClick={updateCompanyTaxData} className='mt-5 mb-5'>Refresh Company Tax Data</Button>
                    </div>
                </div>
            )} */}

            {/* <Divider /> */}

            <Button onClick={() => props.setIsModalOpen(false)}>{t('close')}</Button>

        </Modal>
    );
}