/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { Company } from 'common/interfaces/company.interface';
import { CompanyService } from 'common/services/company.service';
import { RootState } from 'common/stores/store';
import { Card } from 'components/cards/Card';
import { Element } from 'components/cards/Element';
import { InputField } from 'components/forms/InputField';
import { SelectField } from 'components/forms/SelectField';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Image } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Container from 'typedi';

export function Details() {
  const [t] = useTranslation();
  const companyService = Container.get(CompanyService);
  const company = useSelector((state: RootState) => state.company.api);
  const [initialValues, setInitialValues] = useState<Partial<Company>>({
    settings: {
      name: '',
      id_number: '',
      vat_number: '',
      website: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (company.hasOwnProperty('settings')) {
      setInitialValues({
        settings: {
          name: company.settings.name,
          id_number: company.settings.id_number,
          vat_number: company.settings.vat_number,
          website: company.settings.website,
          email: company.settings.email,
          phone: company.settings.phone,
        },
      });
    }
  }, [company]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: (values: Partial<Company>) => {
      toast.promise(companyService.update(company.id, values), {
        success: t('updated_settings'),
        error: t('error_title'),
        loading: t('processing'),
      });
    },
  });

  return (
    <Card
      withSaveButton
      onFormSubmit={formik.handleSubmit}
      title={t('details')}
    >
      <Element leftSide={t('name')}>
        <InputField
          value={formik.values.settings?.name}
          onChange={formik.handleChange}
          id="settings.name"
        />
      </Element>
      <Element leftSide={t('id_number')}>
        <InputField
          value={formik.values.settings?.id_number}
          onChange={formik.handleChange}
          id="settings.id_number"
        />
      </Element>
      <Element leftSide={t('vat_number')}>
        <InputField
          value={formik.values.settings?.vat_number}
          onChange={formik.handleChange}
          id="settings.vat_number"
        />
      </Element>
      <Element leftSide={t('website')}>
        <InputField
          value={formik.values.settings?.website}
          onChange={formik.handleChange}
          id="settings.website"
        />
      </Element>
      <Element leftSide={t('email')}>
        <InputField
          value={formik.values.settings?.email}
          onChange={formik.handleChange}
          id="settings.email"
        />
      </Element>
      <Element leftSide={t('phone')}>
        <InputField
          value={formik.values.settings?.phone}
          onChange={formik.handleChange}
          id="settings.phone"
        />
      </Element>
      <Element leftSide={t('size_id')}>
        <SelectField onChange={formik.handleChange} id="size_id">
          <option value="1">1 - 3</option>
          <option value="2">4 - 10</option>
          <option value="3">11 - 50</option>
          <option value="4">51 - 100</option>
          <option value="5">101 - 500</option>
          <option value="6">500+</option>
        </SelectField>
      </Element>
      <Element leftSide={t('industry_id')}>
        <SelectField onChange={formik.handleChange} id="industry_id">
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
  );
}
