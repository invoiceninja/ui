import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Client } from '$app/common/interfaces/client';
import { Button } from '$app/components/forms';
import { Modal } from '$app/components/Modal';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  client: Client | undefined;
}

export function ClientTaxDataModal({ client }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const currentCompany = useCurrentCompany();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const PROPERTY_LABELS = useMemo(
    () => ({
      geoPostalCode: t('geo_postal_code'),
      geoCity: t('geo_city'),
      geoCounty: t('geo_county'),
      geoState: t('geo_state'),
      geoSales: t('geo_sales'),
      taxUse: t('tax_use'),
      txbService: t('txb_service'),
      txbFreight: t('txb_freight'),
      stateSalesTax: t('state_sales_tax'),
      stateUseTax: t('state_use_tax'),
      citySalesTax: t('city_sales_tax'),
      cityUseTax: t('city_use_tax'),
      cityTaxCode: t('city_tax_code'),
      countySalesTax: t('county_sales_tax'),
      countyUseTax: t('county_use_tax'),
      countyTaxCode: t('county_tax_code'),
      districtSalesTax: t('district_sales_tax'),
      districtUseTax: t('district_use_tax'),
      district1Code: t('district1_code'),
      district1SalesTax: t('district1_sales_tax'),
      district1UseTax: t('district1_use_tax'),
      district2Code: t('district2_code'),
      district2SalesTax: t('district2_sales_tax'),
      district2UseTax: t('district2_use_tax'),
      district3Code: t('district3_code'),
      district3SalesTax: t('district3_sales_tax'),
      district3UseTax: t('district3_use_tax'),
      district4Code: t('district4_code'),
      district4SalesTax: t('district4_sales_tax'),
      district4UseTax: t('district4_use_tax'),
      district5Code: t('district5_code'),
      district5SalesTax: t('district5_sales_tax'),
      district5UseTax: t('district5_use_tax'),
      originDestination: t('origin_destination'),
    }),
    []
  );

  console.log(Object.entries(client?.tax_info || {}));

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
        size="regular"
      >
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(client?.tax_info || {})
            .filter(([key]) => key.length > 2)
            .map(([key, value]) => (
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
      </Modal>
    </>
  );
}
