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
      number:vendor?.data.data.number
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
          <Address></Address>
        </div>
        {console.log(vendor?.data.data.name)}
        <div className="w-full xl:w-1/2">
          <AdditionalInfo></AdditionalInfo>
          <Contacts></Contacts>
        </div>
      </div>
    </Default>
  );
}
