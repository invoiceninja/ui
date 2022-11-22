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
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { Modal } from 'components/Modal';
import { useState, SetStateAction, Dispatch } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function CompanyCreate(props: Props) {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleSave = async () => {
    if (!isFormBusy) {
      toast.processing();

      setIsFormBusy(true);

      try {
        await request('POST', endpoint('/api/v1/companies'));

        toast.success('created_company');

        props.setIsModalOpen(false);

        window.location.href = route('/');
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(axiosError);
        toast.error();
        setIsFormBusy(false);
      }
    }
  };

  return (
    <Modal
      title={t('add_company')}
      visible={props.isModalOpen}
      onClose={() => props.setIsModalOpen(false)}
      size="small"
      backgroundColor="white"
    >
      <span className="text-lg text-gray-900">Are you sure?</span>
      <div className="flex justify-end space-x-4 mt-5">
        <Button
          className="text-gray-900"
          onClick={() => props.setIsModalOpen(false)}
          type="minimal"
        >
          <span className="text-base mx-3">{t('cancel')}</span>
        </Button>
        <Button onClick={handleSave}>
          <span className="text-base mx-3">{t('yes')}</span>
        </Button>
      </div>
    </Modal>
  );
}
