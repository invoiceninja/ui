/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import CommonProps from '../../common/interfaces/common-props.interface';
import 'react-datepicker/dist/react-datepicker.css';

interface Props extends CommonProps {}

export function Datepicker(props: Props) {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <ReactDatePicker
      selected={date}
      className={`w-full py-2 px-3 rounded border border-gray-300 text-sm ${props.className}`}
      onChange={(date) => setDate(date as Date)}
    />
  );
}
