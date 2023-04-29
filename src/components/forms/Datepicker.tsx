/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  createElement,
  forwardRef,
  HTMLProps,
  Ref,
  useEffect,
  useState,
} from 'react';
import ReactDatePicker from 'react-datepicker';
import CommonProps from '../../common/interfaces/common-props.interface';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { Icon } from '../icons/Icon';
import { MdCalendarMonth } from 'react-icons/md';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date as formatDate } from '$app/common/helpers';

interface Props extends CommonProps {
  required?: boolean;
  onValueChange?: (value: string) => unknown;
  minDate?: string;
}

export function DatePicker(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setDate(props.value ? new Date(props.value) : null);
  }, [props.value]);

  const getFormattedValue = () => {
    let formattedValue = '';

    if (date) {
      formattedValue = formatDate(dayjs(date).format('YYYY-MM-DD'), dateFormat);
    }

    return formattedValue;
  };

  const handleOnValueChange = (currentDate: Date | null) => {
    const dateValue = currentDate
      ? dayjs(currentDate).format('YYYY-MM-DD')
      : '';

    props.onValueChange && props.onValueChange(dateValue);
  };

  const CustomInputArea = (
    props: HTMLProps<HTMLInputElement>,
    ref: Ref<HTMLInputElement>
  ) => (
    <div className="flex items-center justify-end">
      <input
        placeholder={dayjs().format(dateFormat)}
        onClick={props.onClick}
        value={getFormattedValue()}
        onChange={props.onChange}
        className={`w-full py-2 px-3 rounded text-sm text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-300 ${props.className}`}
        ref={ref}
      />

      {!date && (
        <div onClick={props.onClick} className="absolute mr-2 cursor-pointer">
          <Icon element={MdCalendarMonth} size={20} />
        </div>
      )}
    </div>
  );

  return (
    <ReactDatePicker
      portalId="root"
      id={props.id}
      selected={date}
      showPopperArrow={false}
      required={props.required}
      disabled={props.disabled}
      customInput={createElement(forwardRef(CustomInputArea))}
      minDate={props.minDate ? new Date(props.minDate) : null}
      onChange={(currentDate) => handleOnValueChange(currentDate)}
      isClearable
      clearButtonClassName={`mr-1 after:bg-[${accentColor}] after:content-['x']`}
      todayButton={t('today')}
    />
  );
}
