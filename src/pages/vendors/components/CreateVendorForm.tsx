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
import axios, { AxiosError } from 'axios';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { endpoint } from '$app/common/helpers';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { Vendor } from '$app/common/interfaces/vendor';
import { useBlankVendorQuery } from '$app/common/queries/vendor';
import { updateRecord } from '$app/common/stores/slices/company-users';
import { Form } from '$app/pages/vendors/edit/components/Form';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds?: Dispatch<SetStateAction<string[]>>;
  onVendorCreated?: (vendor: Vendor) => unknown;
}

export function CreateVendorForm(props: Props) {
  const [t] = useTranslation();

  const { data } = useBlankVendorQuery();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const company = useInjectCompanyChanges();

  const [vendor, setVendor] = useState<Vendor>();

  const [errors, setErrors] = useState<ValidationBag>();

  useEffect(() => {
    if (data) {
      setVendor({
        ...data,
        country_id: '',
        contacts: [
          {
            id: '',
            first_name: '',
            last_name: '',
            email: '',
            send_email: true,
            created_at: 0,
            updated_at: 0,
            archived_at: 0,
            is_primary: false,
            phone: '',
            custom_value1: '',
            custom_value2: '',
            custom_value3: '',
            custom_value4: '',
            link: '',
          },
        ],
      });
    }
  }, [data]);

  const handleSave = () => {
    toast.processing();

    axios
      .all([
        request('POST', endpoint('/api/v1/vendors'), vendor),
        request(
          'PUT',
          endpoint('/api/v1/companies/:id', { id: company?.id }),
          company
        ),
      ])
      .then((response) => {
        toast.success('created_vendor');

        dispatch(
          updateRecord({ object: 'company', data: response[1].data.data })
        );

        queryClient.invalidateQueries('/api/v1/vendors');

        window.dispatchEvent(
          new CustomEvent('invalidate.combobox.queries', {
            detail: {
              url: endpoint('/api/v1/vendors'),
            },
          })
        );

        if (props.setSelectedIds) {
          props.setSelectedIds([response[0].data.data.id]);
        }

        if (props.onVendorCreated) {
          props.onVendorCreated(response[0].data.data);
        }

        setVendor(data);
        props.setVisible(false);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        } else {
          console.error(error);
          toast.error();
        }
      });
  };

  return (
    <>
      {vendor && <Form vendor={vendor} setVendor={setVendor} errors={errors} />}

      <div className="flex justify-end space-x-4 mt-5">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </>
  );
}
