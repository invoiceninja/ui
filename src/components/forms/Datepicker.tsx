/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import CommonProps from '../../common/interfaces/common-props.interface';
import 'react-datepicker/dist/react-datepicker.css';

type Props = CommonProps;

export function Datepicker(props: Props) {
  const [date, setDate] = useState<Date>(props.value?new Date(props.value):new Date());
console.log(props.value)
  return (
    <ReactDatePicker
      selected={date}
      className={`w-full py-2 px-3 rounded border border-gray-300 text-sm ${props.className}`}
      onChange={(date) => {
        setDate(date as Date)
        props.onChange(date?.toISOString()
        .split('T')[0])
      }
        
        
      }
    />
  );
}
