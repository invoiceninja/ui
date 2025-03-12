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
import { Modal } from '$app/components/Modal';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VerificationInput from 'react-verification-input';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  resendSmsCode: () => void;
  verifyPhoneNumber: (code: string) => void;
}

export function SmsVerificationModal(props: Props) {
  const [t] = useTranslation();

  const { resendSmsCode, verifyPhoneNumber, setVisible } = props;

  const [code, setCode] = useState<string>('');

  return (
    <Modal
      title={t('sms_code')}
      visible={props.visible}
      onClose={() => {
        setVisible(false);
        setCode('');
      }}
    >
      <div>
        <div className="flex justify-end mb-1">
          <Button behavior="button" type="minimal" onClick={() => setCode('')}>
            {t('clear')}
          </Button>
        </div>

        <div className="flex justify-center">
          <VerificationInput value={code} onChange={setCode} />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            behavior="button"
            type="minimal"
            onClick={() => {
              resendSmsCode();
              setCode('');
            }}
          >
            {t('resend_code')}
          </Button>

          <Button
            behavior="button"
            onClick={() => verifyPhoneNumber(code)}
            disableWithoutIcon
            disabled={code.length !== 6}
          >
            {t('verify')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
