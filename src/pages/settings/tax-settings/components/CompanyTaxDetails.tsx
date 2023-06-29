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

interface Props {
    isModalOpen: boolean;
    setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyTaxDetails(props: Props) {
    const [t] = useTranslation();

    const company = useCurrentCompany();

    return (
        <Modal
            title="Company Tax Configuration"
            visible={props.isModalOpen}
            onClose={() => props.setIsModalOpen(false)}
            backgroundColor="white"
        >

            <Button onClick={() => props.setIsModalOpen(false)}>{t('close')}</Button>

        </Modal>
    );
}