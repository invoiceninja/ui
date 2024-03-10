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
import { useColorScheme } from '$app/common/colors';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  type: 'activity' | 'phone';
}

export function AccountWarningsModal(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();
  const colors = useColorScheme();

  return (
    <Modal
      title={
        props.type === 'activity'
          ? t('activate_company')
          : t('verify_phone_number')
      }
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <div className=""
        style={{ backgroundColor: colors.$2, color: colors.$3, colorScheme: colors.$0 }}
      >
        <p>
          {props.type === 'activity'
            ? t('company_disabled_warning')
            : t('verify_phone_number_help')}
          .
        </p>

        <Button
          type="minimal"
          onClick={() => {
            navigate(
              props.type === 'activity'
                ? '/settings/account_management'
                : '/settings/user_details/enable_two_factor'
            );
            props.setVisible(false);
          }}
        >
          {props.type === 'activity'
            ? t('activate_company')
            : t('verify_phone_number')}
        </Button>
      </div>
    </Modal>
  );
}
