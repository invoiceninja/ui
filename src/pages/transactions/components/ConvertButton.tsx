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
import React, { FormEvent } from 'react';
import { MdContentCopy } from 'react-icons/md';

interface Props {
  isFormBusy: boolean;
  text: string;
  onClick: (event: FormEvent<HTMLFormElement>) => void;
}

export function ConvertButton(props: Props) {
  return (
    <Button
      className="w-full"
      onClick={(event: FormEvent<HTMLFormElement>) => props.onClick(event)}
      disabled={props.isFormBusy}
    >
      {<MdContentCopy fontSize={22} />}
      <span>{props.text}</span>
    </Button>
  );
}
