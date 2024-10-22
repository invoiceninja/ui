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
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { PEPPOL_COUNTRIES } from '../../EInvoice';
import { TaxSetting } from '$app/common/interfaces/company.interface';
import { cloneDeep } from 'lodash';
import { Icon } from '$app/components/icons/Icon';
import { MdClose } from 'react-icons/md';

export function EUTaxDetails() {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();

  const resolveCountry = useResolveCountry();
  const handleChange = useHandleCurrentCompanyChangeProperty();

  const displayVatNumberField = (countryKey: string) => {
    const isCountryInPEPPOLNetwork = PEPPOL_COUNTRIES.some((countryId) =>
      countryKey.startsWith(resolveCountry(countryId)?.iso_3166_2 || '')
    );
    const isCountrySelected =
      typeof companyChanges?.tax_data.regions.EU.subregions[countryKey]
        .vat_number === 'string';

    return isCountryInPEPPOLNetwork && isCountrySelected;
  };

  const displayCountryOption = (countryId: string) => {
    const countryIso = resolveCountry(countryId)?.iso_3166_2 || '';

    const isCountrySubregionAvailable = Object.keys(
      companyChanges?.tax_data?.regions?.EU.subregions
    ).some((key) => key.startsWith(countryIso));

    const isCountrySelected = Object.keys(
      companyChanges?.tax_data?.regions?.EU.subregions
    ).some(
      (key) =>
        key.startsWith(countryIso) &&
        typeof companyChanges?.tax_data.regions.EU.subregions[key]
          .vat_number === 'string'
    );

    return isCountrySubregionAvailable && !isCountrySelected;
  };

  const handleDeleteVatNumber = (countryKey: string) => {
    const currentCountrySubregion = cloneDeep(
      companyChanges?.tax_data?.regions?.EU.subregions[countryKey]
    );

    delete currentCountrySubregion.vat_number;

    handleChange(
      `tax_data.regions.EU.subregions.${countryKey}`,
      currentCountrySubregion
    );
  };

  return (
    <div className="flex flex-col">
      <Element leftSide={t('country')}>
        <SelectField
          value=""
          onValueChange={(value) => {
            const countryIso = resolveCountry(value)?.iso_3166_2 || '';

            const currentSubregions =
              cloneDeep(companyChanges?.tax_data?.regions?.EU.subregions) || {};

            Object.keys(currentSubregions).forEach((key) => {
              if (key.startsWith(countryIso)) {
                handleChange(
                  `tax_data.regions.EU.subregions.${key}.vat_number`,
                  ''
                );
              }
            });
          }}
          customSelector
          clearAfterSelection
        >
          {PEPPOL_COUNTRIES.filter((currentCountryId) =>
            displayCountryOption(currentCountryId)
          ).map((countryId) => (
            <option key={countryId} value={countryId}>
              {resolveCountry(countryId)?.name}
            </option>
          ))}
        </SelectField>
      </Element>

      {Object.entries(companyChanges?.tax_data?.regions?.EU.subregions).map(
        ([key, value]) =>
          displayVatNumberField(key) && (
            <Element key={key} leftSide={`${key} - ${t('vat_number')}`}>
              <div className="flex flex-1 items-center space-x-4">
                <div className="w-full">
                  <InputField
                    value={(value as TaxSetting).vat_number || ''}
                    onValueChange={(value) =>
                      handleChange(
                        `tax_data.regions.EU.subregions.${key}.vat_number`,
                        value
                      )
                    }
                  />
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => handleDeleteVatNumber(key)}
                >
                  <Icon element={MdClose} size={23} />
                </div>
              </div>
            </Element>
          )
      )}
    </div>
  );
}
