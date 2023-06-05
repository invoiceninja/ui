/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { USStateSelector } from '$app/components/USStateSelector';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { EUCountrySelector } from '$app/components/EUCountrySelector';
import { useResolveEu } from '$app/common/hooks/useResolveEu';
import { InputField } from '$app/components/forms';
import { useEffect } from 'react';

export function SellerSubregion() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const resolveCountry = useResolveCountry();
  const resolveEu = useResolveEu();

  useEffect(() => {
    if (companyChanges?.settings.country_id === '36') {
      handleChange('tax_data.seller_subregion', 'AU');
    }
  }, [
    companyChanges?.settings.country_id,
    companyChanges.tax_data.seller_subregion,
  ]);

  return (
    <Element leftSide={t('seller_subregion')}>
      {resolveCountry(companyChanges?.settings.country_id)?.iso_3166_2 ===
        'US' && (
        <USStateSelector
          value={companyChanges.tax_data?.seller_subregion}
          onChange={(value) => handleChange('tax_data.seller_subregion', value)}
        />
      )}
      {resolveEu(companyChanges?.settings.country_id) && (
        <EUCountrySelector
          value={
            companyChanges.tax_data?.seller_subregion
              ? companyChanges.tax_data?.seller_subregion
              : resolveCountry(companyChanges?.settings.country_id)?.iso_3166_2
          }
          onChange={(value) => handleChange('tax_data.seller_subregion', value)}
        />
      )}
      {resolveCountry(companyChanges?.settings.country_id)?.iso_3166_2 ===
        'AU' && (
        <InputField
          type="text"
          disabled={true}
          name="tax_data.seller_subregion"
          value={'AU'}
        />
      )}
    </Element>
  );
}
