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
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { MdContentCopy } from 'react-icons/md';

interface Props {
  isFormBusy: boolean;
  isCreditTransactionType: boolean;
  onClick: (event: FormEvent<HTMLFormElement>) => void;
}

export function ConvertButton(props: Props) {
  const [t] = useTranslation();

  return (
    <Button
      className="w-full"
      onClick={props.onClick}
      disabled={props.isFormBusy}
    >
      {<MdContentCopy fontSize={22} />}
      <span>
        {props.isCreditTransactionType
          ? t('convert_to_payment')
          : t('convert_to_expense')}
      </span>
    </Button>
  );
}
