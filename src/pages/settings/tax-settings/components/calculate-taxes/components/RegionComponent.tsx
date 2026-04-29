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
import { TaxSetting } from '$app/common/interfaces/company.interface';
import { Element } from '$app/components/cards';
import { Button, Checkbox, SelectField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { ChangeEvent, ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EditSubRegionModal } from './EditSubRegionModal';

interface RegionComponentProps {
  regionCode: string;
  regionName: string;
  elementKey?: string;
  showSalesAboveThreshold?: boolean;
  textSmall?: boolean;
  children?: ReactNode;
}

export function RegionComponent({
  regionCode,
  regionName,
  elementKey,
  showSalesAboveThreshold = false,
  textSmall = false,
  children,
}: RegionComponentProps) {
  const [t] = useTranslation();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const companyChanges = useCompanyChanges();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditSubregionModalOpen, setIsEditSubregionModalOpen] =
    useState<boolean>(false);

  const regionData =
    companyChanges?.tax_data?.regions?.[regionCode] ||
    companyChanges.tax_data.regions[regionCode];

  const regions: Array<[string, TaxSetting]> = Object.entries(
    regionData?.subregions || {}
  );
  const [taxSetting, setTaxSetting] = useState<TaxSetting>(regions[0]?.[1]);
  const [subRegion, setSubRegion] = useState<string>(regions[0]?.[0]);

  const checkboxRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const countSelected = useMemo(() => {
    return regions.filter(([, taxSetting]) => taxSetting.apply_tax).length;
  }, [regions]);

  const handleChangeAndUpdateView = (value: string, checked: boolean) => {
    handleChange(value, checked);
    setIsOpen(!checked);
  };

  const handleRowClick = (subregionKey: string) => {
    const checkbox = checkboxRefs.current[subregionKey];

    if (checkbox && !checkbox.disabled) {
      const newChecked = !checkbox.checked;
    
      checkbox.checked = newChecked;
    
      handleChange(
        `tax_data.regions.${regionCode}.subregions.${subregionKey}.apply_tax`,
        newChecked
      );
    }
  };

  const subregionBasePath = `tax_data.regions.${regionCode}.subregions`;
  const regionBasePath = `tax_data.regions.${regionCode}`;

  return (
    <>
      <Element leftSide={regionName} key={elementKey || regionCode}>
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-4">
            <SelectField
              id={`${regionBasePath}.tax_all_subregions`}
              value={regionData?.tax_all_subregions}
              onValueChange={(value) =>
                handleChangeAndUpdateView(
                  `${regionBasePath}.tax_all_subregions`,
                  value === 'true'
                )
              }
            >
              <option value="true">{t('tax_all')}</option>
              <option value="false">
                {t('tax_selected')} - [ {countSelected} {t('selected')} ]
              </option>
            </SelectField>
          </div>

          {!regionData?.tax_all_subregions && (
            <div className="flex col-span-1 col-start-5 col-end-6 justify-end">
              <Button
                type="primary"
                onClick={(e: ChangeEvent<HTMLInputElement>) => {
                  e.preventDefault();
                  setIsOpen((isOpen) => !isOpen);
                }}
              >
                {isOpen ? t('hide') : t('show')}
              </Button>
            </div>
          )}
        </div>
      </Element>
      {isOpen &&
        regions?.map((value: [string, TaxSetting], index) => (
          <div
            key={index}
            className={`border py-4 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-10 flex flex-col lg:flex-row px-5 sm:px-6 lg:items-center ${
              textSmall ? 'text-sm' : ''
            }`}
          >
            <div
              className="flex col-span-1 items-center justify-start pl-5"
              onClick={(e) => {
                if (e.target instanceof HTMLInputElement) {
                  return;
                }
                handleRowClick(value[0]);
              }}
            >
              <Checkbox
                id={`${subregionBasePath}.${value[0]}`}
                value={`${subregionBasePath}.${value[0]}.apply_tax`}
                checked={value[1].apply_tax ? true : false}
                className="flex justify-end h-6 w-6 rounded-half shadow"
                disabled={regionData?.tax_all_subregions}
                onValueChange={(value, checked) => handleChange(value, checked)}
                innerRef={(el: HTMLInputElement | null) => {
                  checkboxRefs.current[value[0]] = el;
                }}
              />

              <div>{value[0]}</div>
            </div>

            <div onClick={() => handleRowClick(value[0])}>
              {value[1].tax_name} {value[1].tax_rate}%{' '}
              {value[1].reduced_tax_rate
                ? ` :: ${t('reduced_rate')} ${value[1].reduced_tax_rate}%`
                : ''}
            </div>

            <div className="flex justify-end">
              <Button
                type="primary"
                disableWithoutIcon={true}
                disabled={regionData?.tax_all_subregions}
                onClick={(e: ChangeEvent<HTMLInputElement>) => {
                  e.preventDefault();
                  setTaxSetting(value[1]);
                  setSubRegion(value[0]);
                  setIsEditSubregionModalOpen(true);
                }}
              >
                {t('edit')}
              </Button>
            </div>
          </div>
        ))}

      <EditSubRegionModal
        visible={isEditSubregionModalOpen}
        setVisible={setIsEditSubregionModalOpen}
        region={regionCode}
        subregion={subRegion}
        taxSetting={taxSetting}
      />

      {showSalesAboveThreshold && (
        <Element
          leftSide={
            <p className="lg:pl-5">({regionCode}) {t('sales_above_threshold')}</p>
          }
        >
          <Toggle
            id={`${regionBasePath}.has_sales_above_threshold`}
            checked={regionData?.has_sales_above_threshold}
            onValueChange={(v) =>
              handleChange(`${regionBasePath}.has_sales_above_threshold`, v)
            }
          />
        </Element>
      )}

      {children}
    </>
  );
}
