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
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <div className="text-gray-900">
        <p>{t('company_disabled_warning')}.</p>

        <Button
          type="minimal"
          onClick={() => {
            navigate('/settings/account_management');
            props.setVisible(false);
          }}
        >
          {t('go_to_settings')}
        </Button>
      </div>
    </Modal >
  );
}
