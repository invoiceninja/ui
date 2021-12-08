/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from 'axios';
import { Company } from 'common/interfaces/company.interface';
import { useStaticsQuery } from 'common/queries/statics';
import { CompanyService } from 'common/services/company.service';
import { updateCompany } from 'common/stores/slices/company';
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
import { useDispatch, useSelector } from 'react-redux';
import Container from 'typedi';

export function Details() {
  const [t] = useTranslation();

  const companyService = Container.get(CompanyService);
  const company = useSelector((state: RootState) => state.company.api);
  const { data } = useStaticsQuery();
  const dispatch = useDispatch();

  const [initialValues, setInitialValues] = useState<Partial<Company>>({
    size_id: '',
    industry_id: '',
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
        size_id: company.size_id,
        industry_id: company.industry_id,
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
      toast.loading(t('processing'));

      companyService
        .update(company.id, values)
        .then((response: AxiosResponse) => {
          toast.dismiss();
          toast.success(t('updated_settings'));

          dispatch(updateCompany(response.data.data));
        })
        .catch((error: AxiosError) => {
          toast.dismiss();
          toast.error(t('error_title'));
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
        <SelectField
          value={formik.values.size_id}
          onChange={formik.handleChange}
          id="size_id"
        >
          {data?.data.sizes.map((size: { id: string; name: string }) => (
            <option key={size.id} value={size.id}>
              {size.name}
            </option>
          ))}
        </SelectField>
      </Element>
      <Element leftSide={t('industry_id')}>
        <SelectField
          value={formik.values.industry_id}
          onChange={formik.handleChange}
          id="industry_id"
        >
          {data?.data.industries.map(
            (industry: { id: string; name: string }) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            )
          )}
        </SelectField>
      </Element>
    </Card>
  );
}
