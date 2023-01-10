/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { MdWarning } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Button } from './forms';
import { Modal } from './Modal';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function CompanyActivityModal(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  return (
    <Modal
      title={t('activate_company')}
      size="small"
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <div className="flex flex-col justify-center space-y-7 pb-1 px-3 text-center">
        <div className="flex justify-center items-center space-x-3">
          <MdWarning fontSize={22} color="#e6b05c" />

          <span className="text-gray-800 text-base font-medium">
            {t('company_disabled_warning')}.
          </span>
        </div>

        <div className="flex justify-end items-center w-full">
          <Button
            type="primary"
            onClick={() => {
              navigate('/settings/account_management');
              props.setVisible(false);
            }}
          >
            <div className="flex items-center">
              {t('settings')}

              <AiOutlineArrowRight className="ml-2" fontSize={18} />
            </div>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
