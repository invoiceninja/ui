/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useRefetch } from '$app/common/hooks/useRefetch';
import {
  resetChanges,
  updateRecord,
} from '$app/common/stores/slices/company-users';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export interface TaxDataPayload {
  geoPostalCode: string;
  geoCity: string;
  geoCounty: string;
  geoState: string;
  taxSales: number;
  taxUse: number;
}

interface Props {
  resourceId?: string;
  resourceType?: 'client' | 'company';
  taxData: TaxDataPayload | undefined;
  refetchInvoices?: boolean;
  buttonClassName?: string;
  buttonType?: 'minimal' | 'secondary';
}

export function TaxDataModal({
  resourceId,
  resourceType,
  taxData,
  refetchInvoices,
  buttonClassName,
  buttonType = 'minimal',
}: Props) {
  const [t] = useTranslation();

  const refetch = useRefetch();
  const dispatch = useDispatch();

  const colors = useColorScheme();
  const currentCompany = useCurrentCompany();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!isFormBusy) {
      toast.processing();

      setIsFormBusy(true);

      let endpointURL = '/api/v1/clients/:id/updateTaxData';

      if (resourceType === 'company') {
        endpointURL = '/api/v1/companies/updateOriginTaxData/:id';
      }

      request('POST', endpoint(endpointURL, { id: resourceId }))
        .then((response) => {
          if (resourceType === 'client') {
            refetch(['clients']);
          } else if (resourceType === 'company') {
            dispatch(
              updateRecord({ object: 'company', data: response.data.data })
            );
            dispatch(resetChanges('company'));
          }

          if (refetchInvoices) {
            refetch(['invoices']);
          }

          toast.success('updated_tax_data');

          handleClose();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const PROPERTY_LABELS = useMemo(
    () => ({
      geoPostalCode: 'ZIP',
      geoCity: 'City',
      geoCounty: 'County',
      geoState: 'State',
      taxSales: 'Sales Tax',
      taxUse: 'Use Tax',
    }),
    []
  );

  const getFormattedValue = (key: string, value: string | number) => {
    if (key === 'taxSales' || key === 'taxUse') {
      return `${((value || 0) as number) * 100} %`;
    }

    return value;
  };

  const TAX_INFO_DATA = useMemo(() => {
    return Object.entries(taxData || {}).filter(
      ([key]) => PROPERTY_LABELS[key as keyof typeof PROPERTY_LABELS]
    );
  }, [taxData]);

  if (
    currentCompany?.settings.country_id !== '840' ||
    !currentCompany?.calculate_taxes
  ) {
    return null;
  }

  return (
    <>
      <Button
        type={buttonType}
        behavior="button"
        onClick={() => setIsModalOpen(true)}
        className={buttonClassName}
      >
        {t('tax_details')}
      </Button>

      <Modal
        title={t('tax_details')}
        visible={isModalOpen}
        onClose={handleClose}
        size={
          TAX_INFO_DATA.length && TAX_INFO_DATA.every(([key, value]) => value)
            ? 'small'
            : 'extraSmall'
        }
        disableClosing={isFormBusy}
      >
        {TAX_INFO_DATA.length && TAX_INFO_DATA.every(([, value]) => value) ? (
          <div className="grid grid-cols-2 gap-4">
            {TAX_INFO_DATA.map(([key, value]) => (
              <div key={key} className="flex items-center gap-x-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$3 }}
                >
                  {PROPERTY_LABELS[key as keyof typeof PROPERTY_LABELS]}:
                </span>

                <span className="text-sm" style={{ color: colors.$3 }}>
                  {getFormattedValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Button className="w-full" behavior="button" onClick={handleSave}>
            {t('update_tax_details')}
          </Button>
        )}
      </Modal>
    </>
  );
}
