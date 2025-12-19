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
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Button, InputField } from '$app/components/forms';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import { cloneDeep, set } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client | undefined;
}

export interface TaxDataPayload {
  geoPostalCode: string;
  geoCity: string;
  geoCounty: string;
  geoState: string;
  taxSales: number;
  taxUse: number;
}

const INITIAL_TAX_DATA_PAYLOAD: TaxDataPayload = {
  geoPostalCode: '',
  geoCity: '',
  geoCounty: '',
  geoState: '',
  taxSales: 0,
  taxUse: 0,
};

export function ClientTaxDataModal({ client }: Props) {
  const [t] = useTranslation();

  const refetch = useRefetch();

  const colors = useColorScheme();
  const currentCompany = useCurrentCompany();

  const [errors, setErrors] = useState<ValidationBag>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isEnteringData, setIsEnteringData] = useState<boolean>(false);
  const [taxDataPayload, setTaxDataPayload] = useState<TaxDataPayload>(
    INITIAL_TAX_DATA_PAYLOAD
  );

  const handleClose = () => {
    setIsModalOpen(false);
    setIsEnteringData(false);
    setTaxDataPayload(INITIAL_TAX_DATA_PAYLOAD);
    setErrors(undefined);
  };

  const handleChange = (key: keyof TaxDataPayload, value: any) => {
    const updatedPayload = cloneDeep(taxDataPayload);
    set(updatedPayload, key, value);
    setTaxDataPayload(updatedPayload);
  };

  const handleSave = () => {
    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request(
        'POST',
        endpoint('/api/v1/clients/:id/updateTaxData', { id: client?.id }),
        taxDataPayload
      )
        .then(() => {
          refetch(['clients']);

          toast.success('tax_data_saved');

          handleClose();
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
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

  useEffect(() => {
    if (!isModalOpen) {
      setIsEnteringData(false);
      setTaxDataPayload(INITIAL_TAX_DATA_PAYLOAD);
      setErrors(undefined);
    }
  }, [isModalOpen]);

  const TAX_INFO_DATA = useMemo(() => {
    return Object.entries(client?.tax_info || {}).filter(
      ([key]) => PROPERTY_LABELS[key as keyof typeof PROPERTY_LABELS]
    );
  }, [client?.tax_info]);

  if (
    currentCompany?.settings.country_id !== '840' ||
    !currentCompany?.calculate_taxes
  ) {
    return null;
  }

  return (
    <>
      <Button
        type="secondary"
        behavior="button"
        onClick={() => setIsModalOpen(true)}
      >
        {t('tax_data')}
      </Button>

      <Modal
        title={t('tax_data')}
        visible={isModalOpen}
        onClose={handleClose}
        size={TAX_INFO_DATA.length ? 'small' : 'extraSmall'}
        disableClosing={isFormBusy}
      >
        {TAX_INFO_DATA.length ? (
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
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {isEnteringData ? (
              <div className="flex flex-col gap-y-4 w-full">
                <InputField
                  label="ZIP"
                  value={taxDataPayload.geoPostalCode}
                  onValueChange={(value) =>
                    handleChange('geoPostalCode', value)
                  }
                  errorMessage={errors?.errors?.geoPostalCode}
                />

                <InputField
                  label="City"
                  value={taxDataPayload.geoCity}
                  onValueChange={(value) => handleChange('geoCity', value)}
                  errorMessage={errors?.errors?.geoCity}
                />

                <InputField
                  label="County"
                  value={taxDataPayload.geoCounty}
                  onValueChange={(value) => handleChange('geoCounty', value)}
                  errorMessage={errors?.errors?.geoCounty}
                />

                <InputField
                  label="State"
                  value={taxDataPayload.geoState}
                  onValueChange={(value) => handleChange('geoState', value)}
                  errorMessage={errors?.errors?.geoState}
                />

                <NumberInputField
                  label="Sales Tax"
                  value={taxDataPayload.taxSales}
                  onValueChange={(value) => handleChange('taxSales', value)}
                  precision={5}
                  errorMessage={errors?.errors?.taxSales}
                />

                <NumberInputField
                  label="Use Tax"
                  value={taxDataPayload.taxUse}
                  onValueChange={(value) => handleChange('taxUse', value)}
                  precision={5}
                  errorMessage={errors?.errors?.taxUse}
                />

                <Button
                  type="primary"
                  behavior="button"
                  onClick={() => handleSave()}
                  disabled={isFormBusy}
                >
                  {t('save')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-y-4 w-full">
                <div className="text-center text-sm">{t('no_tax_data')}</div>

                <Button
                  className="w-full"
                  behavior="button"
                  onClick={() => setIsEnteringData(true)}
                >
                  {t('enter_tax_data')}
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
