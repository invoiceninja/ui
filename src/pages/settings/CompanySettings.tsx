/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect } from 'react';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/cards';
import Element from '../../components/cards/Element';
import { InputField, SelectField } from '../../components/forms';
import { Settings } from '../../components/layouts/Settings';

export function CompanySettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'company_details'
    )}`;
  });

  return (
    <Settings title={t('company_details')}>
      <Card withSaveButton title={t('details')}>
        <Element leftSide={t('name')}>
          <InputField id="name" />
        </Element>
        <Element leftSide={t('id_number')}>
          <InputField id="id_number" />
        </Element>
        <Element leftSide={t('vat_number')}>
          <InputField id="vat_number" />
        </Element>
        <Element leftSide={t('website')}>
          <InputField id="website" />
        </Element>
        <Element leftSide={t('email')}>
          <InputField id="email" />
        </Element>
        <Element leftSide={t('phone')}>
          <InputField id="phone" />
        </Element>
        <Element leftSide={t('size_id')}>
          <SelectField id="size_id">
            <option value="1">1 - 3</option>
            <option value="2">4 - 10</option>
            <option value="3">11 - 50</option>
            <option value="4">51 - 100</option>
            <option value="5">101 - 500</option>
            <option value="6">500+</option>
          </SelectField>
        </Element>
        <Element leftSide={t('industry_id')}>
          <SelectField id="industry_id">
            <option value="1">Accounting &amp; Legal</option>
            <option value="2">Advertising</option>
            <option value="3">Aerospace</option>
            <option value="4">Agriculture</option>
            <option value="5">Automotive</option>
            <option value="6">Banking &amp; Finance</option>
            <option value="7">Biotechnology</option>
            <option value="8">Broadcasting</option>
            <option value="9">Business Services</option>
            <option value="10">Commodities &amp; Chemicals</option>
            <option value="11">Communications</option>
            <option value="12">Computers &amp; Hightech</option>
            <option value="32">Construction</option>
            <option value="13">Defense</option>
            <option value="14">Energy</option>
            <option value="15">Entertainment</option>
            <option value="16">Government</option>
            <option value="17">Healthcare &amp; Life Sciences</option>
            <option value="18">Insurance</option>
            <option value="19">Manufacturing</option>
            <option value="20">Marketing</option>
            <option value="21">Media</option>
            <option value="22">Nonprofit &amp; Higher Ed</option>
            <option value="30">Other</option>
            <option value="23">Pharmaceuticals</option>
            <option value="31">Photography</option>
            <option value="24">Professional Services &amp; Consulting</option>
            <option value="25">Real Estate</option>
            <option value="33">Restaurant &amp; Catering</option>
            <option value="26">Retail &amp; Wholesale</option>
            <option value="27">Sports</option>
            <option value="28">Transportation</option>
            <option value="29">Travel &amp; Luxury</option>
          </SelectField>
        </Element>
        <Element leftSide={t('logo')}>
          <div className="flex flex-col md:flex-row md:items-center">
            <button
              type="button"
              className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Drag and drop your logo here
              </span>
            </button>
          </div>
        </Element>
      </Card>

      <div className="my-6"></div>
    </Settings>
  );
}
