/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { useVendorQuery } from 'common/queries/vendor';
import { Default } from 'components/layouts/Default';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AdditionalInfo } from './components/AdditionalInfo';
import { Address } from './components/Address';
import { Contacts } from './components/Contacts';
import { Details } from './components/Details';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const { data: vendor } = useVendorQuery({ id });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: vendor?.data.data.name,
      number: vendor?.data.data.number,
      user: vendor?.data.data.user_id,
      id_number: vendor?.data.data.id_number,
      vat_number: vendor?.data.data.vat_number,
      website: vendor?.data.data.website,
      phone: vendor?.data.data.phone,
      address1: vendor?.data.data.address1,
      address2: vendor?.data.data.address2,
      city: vendor?.data.data.city,
      state: vendor?.data.data.state,
      postal_code: vendor?.data.data.postal_code,
      country_id: vendor?.data.data.country_id,
      currency: vendor?.data.data.currency_id,
      private_notes: vendor?.data.data.private_notes,
      public_notes: vendor?.data.data.public_notes,
      contacts: vendor?.data.data.contacts,
    },
    onSubmit: () => {
      console.log('value');
    },
  });

  return (
    <Default title={t('vendor')} onBackClick={''} onSaveClick={''}>
      <div className="flex flex-col xl:flex-row xl:gap-4">
        <div className="w-full xl:w-1/2">
          <Details data={formik.values}></Details>
          <Address data={formik.values}></Address>
        </div>
        {console.log(vendor?.data.data)}
        <div className="w-full xl:w-1/2">
          <AdditionalInfo data={formik.values}></AdditionalInfo>
          <Contacts data={formik.values.contacts}></Contacts>
        </div>
      </div>
    </Default>
  );
}
