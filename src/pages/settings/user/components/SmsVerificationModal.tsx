/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, InputField } from '@invoiceninja/forms';
import { Modal } from 'components/Modal';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  resendSmsCode: () => void;
  verifyPhoneNumber: (code: string) => void;
}

export function SmsVerificationModal(props: Props) {
  const [t] = useTranslation();

  const digitFieldsBox = useRef<HTMLDivElement>(null);

  const digitFields = [
    'digit1',
    'digit2',
    'digit3',
    'digit4',
    'digit5',
    'digit6',
  ];

  const initialCodeValue = ['', '', '', '', '', ''];

  const [code, setCode] = useState<string[]>(initialCodeValue);

  const [isCodeEntered, setIsCodeEntered] = useState<boolean>(false);

  const handleChangeValue = (value: string, fieldIndex: number) => {
    const updatedArray = code.map((currentValue, index) =>
      index === fieldIndex ? value : currentValue
    );

    const isCodeFullyEntered = updatedArray.every((value) => value);

    setIsCodeEntered(isCodeFullyEntered);

    setCode(updatedArray);

    if (value) {
      if (fieldIndex === digitFields.length - 1) {
        (
          digitFieldsBox.current?.children[0].children[0]
            .children[0] as HTMLInputElement
        ).focus();
      } else {
        (
          digitFieldsBox.current?.children[fieldIndex + 1].children[0]
            .children[0] as HTMLInputElement
        ).focus();
      }
    }
  };

  const handleCodeClear = () => {
    (
      digitFieldsBox.current?.children[0].children[0]
        .children[0] as HTMLInputElement
    ).focus();

    setIsCodeEntered(false);

    setCode(initialCodeValue);
  };

  return (
    <Modal
      title={t('sms_code')}
      visible={props.visible}
      onClose={() => props.setVisible(false)}
    >
      <div>
        <div className="flex justify-end mb-1">
          <Button type="minimal" onClick={handleCodeClear}>
            {t('clear')}
          </Button>
        </div>

        <div ref={digitFieldsBox} className="grid grid-flow-col gap-x-2">
          {digitFields.map((field, index) => (
            <InputField
              key={field}
              className="text-center border-gray-800 text-xl"
              maxLength={1}
              value={code[index]}
              onValueChange={(value) => handleChangeValue(value, index)}
            />
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <Button type="minimal" onClick={() => props.resendSmsCode()}>
            {t('resend_code')}
          </Button>

          <Button
            onClick={() => props.verifyPhoneNumber(code.join(''))}
            disableWithoutIcon
            disabled={!isCodeEntered}
          >
            {t('verify')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
