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
      title="Company activity"
      size="small"
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <div className="flex flex-col justify-center space-y-7 pb-1 px-3 text-center">
        <span className="text-gray-800 text-lg font-medium">
          This company has not yet been activated
        </span>

        <div className="flex justify-end items-center w-full">
          <Button
            type="primary"
            onClick={() => navigate('/settings/account_management')}
          >
            {t('settings')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
