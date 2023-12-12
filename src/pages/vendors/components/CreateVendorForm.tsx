/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '$app/components/forms';
import { AxiosError } from 'axios';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { Vendor } from '$app/common/interfaces/vendor';
import { useBlankVendorQuery } from '$app/common/queries/vendor';
import { Form } from '$app/pages/vendors/edit/components/Form';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { set } from 'lodash';
import { VendorContact } from '$app/common/interfaces/vendor-contact';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Props {
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  onVendorCreated?: (vendor: Vendor) => unknown;
}

export function CreateVendorForm(props: Props) {
  const [t] = useTranslation();

  const { data } = useBlankVendorQuery();

  const [vendor, setVendor] = useState<Vendor>();
  const [errors, setErrors] = useState<ValidationBag>();

  const [contacts, setContacts] = useState<Partial<VendorContact>[]>([
    {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      send_email: false,
    },
  ]);

  useEffect(() => {
    if (data) {
      setVendor({
        ...data,
        country_id: '',
      });
    }
  }, [data]);

  const saveCompany = useHandleCompanySave();

  const handleSave = async () => {
    set(vendor as Vendor, 'contacts', contacts);
    toast.processing();

    await saveCompany(true);

    request('POST', endpoint('/api/v1/vendors'), vendor)
      .then((response) => {
        toast.success('created_vendor');

        $refetch(['vendors']);

        if (props.setSelectedIds) {
          props.setSelectedIds([response.data.data.id]);
        }

        if (props.onVendorCreated) {
          props.onVendorCreated(response.data.data);
        }

        setVendor(data);
        props.setVisible(false);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };

  return (
    <>
      {vendor && (
        <Form
          vendor={vendor}
          setVendor={setVendor}
          errors={errors}
          setContacts={setContacts}
          contacts={contacts}
        />
      )}

      <div className="flex justify-end space-x-4 mt-5">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </>
  );
}
