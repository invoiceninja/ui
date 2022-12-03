/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button } from '@invoiceninja/forms';
import axios, { AxiosError } from 'axios';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { endpoint } from 'common/helpers';
import { useInjectCompanyChanges } from 'common/hooks/useInjectCompanyChanges';
import { Vendor } from 'common/interfaces/vendor';
import { useBlankVendorQuery } from 'common/queries/vendor';
import { updateRecord } from 'common/stores/slices/company-users';
import { Modal } from 'components/Modal';
import { Form } from 'pages/vendors/edit/components/Form';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  setSelectedIds: Dispatch<SetStateAction<string[] | undefined>>;
}

export function CreateVendorModal(props: Props) {
  const [t] = useTranslation();

  const { data } = useBlankVendorQuery();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const company = useInjectCompanyChanges();

  const [vendor, setVendor] = useState<Vendor>();

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

        props.setSelectedIds([response[0].data.data.id]);

        props.setVisible(false);
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };

  return (
    <Modal
      title={t('create_vendor')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
      size="large"
    >
      {vendor && <Form vendor={vendor} setVendor={setVendor} />}

      <div className="flex justify-end space-x-4 mt-5">
        <Button onClick={handleSave}>{t('save')}</Button>
      </div>
    </Modal>
  );
}
