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
import { Button, Link } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { CompanyDetails } from './calculate-taxes/CompanyDetails';
import { Divider } from 'antd';
import { AxiosError, AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { EntityTaxData } from './calculate-taxes/EntityTaxData';
import { GenericValidationBag } from '$app/common/interfaces/validation-bag';
import { LoginValidation } from '$app/pages/authentication/common/ValidationInterface';

interface Props {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyTaxDetails(props: Props) {
    const [t] = useTranslation();

    const company = useCurrentCompany();

    const dispatch = useDispatch();

    const updateCompanyTaxData = () => {
        toast.processing();

        request(
            'POST',
            endpoint('/api/v1/companies/updateOriginTaxData/:id', {
                id: company.id,
            }),
        ).then((response: AxiosResponse) => {

            toast.success('success');

            dispatch(
                updateRecord({ object: 'company', data: response.data.data })
            );

        }).catch(
            (error: AxiosError<GenericValidationBag<LoginValidation>>) => {
                toast.error(error.response?.data?.message as string);
            }
        );
    };

    const hasInvalidAddress = () => {
        return company.settings?.postal_code === "" || company.settings?.city === "" ||  company.settings?.state === ""
    };

    return (
        <Modal
            title="Company Tax Configuration"
            visible={props.isModalOpen}
            onClose={() => props.setIsModalOpen(false)}
            backgroundColor="white"
            size="regular"
        >
            <CompanyDetails />

            <Divider />

            {company.origin_tax_data?.geoPostalCode === undefined || 
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
            )}

            <Divider />

            <Button onClick={() => props.setIsModalOpen(false)}>{t('close')}</Button>

        </Modal>
    );
}