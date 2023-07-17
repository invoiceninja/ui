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
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import CommonProps from '../../common/interfaces/common-props.interface';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { Icon } from '../icons/Icon';
import {
  MdCalendarMonth,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from 'react-icons/md';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { date as formatDate } from '$app/common/helpers';
import { Button } from './Button';
import { SelectField } from './SelectField';
import { atom, useAtomValue } from 'jotai';

interface Props extends CommonProps {
  required?: boolean;
  onValueChange?: (value: string) => unknown;
  minDate?: string;
}

interface Month {
  value: number;
  label: string;
}

const MONTHS: Month[] = [
  {
    value: 0,
    label: 'january',
  },
  {
    value: 1,
    label: 'february',
  },
  {
    value: 2,
    label: 'march',
  },
  {
    value: 3,
    label: 'april',
  },
  {
    value: 4,
    label: 'may',
  },
  {
    value: 5,
    label: 'june',
  },
  {
    value: 6,
    label: 'july',
  },
  {
    value: 7,
    label: 'august',
  },
  {
    value: 8,
    label: 'september',
  },
  {
    value: 9,
    label: 'october',
  },
  {
    value: 10,
    label: 'november',
  },
  {
    value: 11,
    label: 'december',
  },
];

export const dayJSLocaleAtom = atom<ILocale | null>(null);

export function DatePicker(props: Props) {
  const [t] = useTranslation();
  const accentColor = useAccentColor();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const dayJSLocale = useAtomValue(dayJSLocaleAtom);

  const [date, setDate] = useState<Date | null>(null);

  const [years, setYears] = useState<number[]>([]);

  const [weekdaysShort, setWeekdaysShort] = useState({
    Sunday: 'Su',
    Monday: 'Mo',
    Tuesday: 'Tu',
    Wednesday: 'We',
    Thursday: 'Th',
    Friday: 'Fr',
    Saturday: 'Sa',
  });

  useEffect(() => {
    setDate(props.value ? new Date(props.value) : null);
  }, [props.value]);

  const updateWeekdaysShort = () => {
    if (dayJSLocale?.weekdaysMin) {
      let updatedWeekdaysShort = { ...weekdaysShort };

      Array.from({ length: 7 }, (_, i) => {
        updatedWeekdaysShort = {
          ...updatedWeekdaysShort,
          [dayjs().locale('en').day(i).format('dddd')]:
            dayJSLocale.weekdaysMin &&
            dayJSLocale.weekdaysMin[i].charAt(0).toUpperCase() +
              dayJSLocale.weekdaysMin[i].slice(1),
        };
      });

      setWeekdaysShort(updatedWeekdaysShort);
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    const yearsList: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      yearsList.push(i);
    }

    setYears(yearsList);

    if (dayJSLocale) {
      updateWeekdaysShort();
    }
  }, []);

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

  const CustomHeaderArea: ReactDatePickerProps['renderCustomHeader'] = ({
    date: currentDate,
    decreaseMonth,
    increaseMonth,
    changeMonth,
    changeYear,
  }) => {
    return (
      <div className="flex flex-col space-y-2 pb-2">
        {currentDate && (
          <span className="text-sm font-bold">{getFormattedValue()}</span>
        )}

        <div className="flex justify-between items-center px-2">
          <div className="flex space-x-1">
            <SelectField
              className="text-xs"
              value={currentDate.getMonth()}
              onValueChange={(value) => changeMonth(parseInt(value))}
              style={{ width: '6rem', padding: '0.3rem' }}
            >
              {MONTHS.map(({ value, label }) => (
                <option value={value} key={value}>
                  {t(label)}
                </option>
              ))}
            </SelectField>

            <SelectField
              className="text-xs"
              value={currentDate.getFullYear()}
              onValueChange={(value) => changeYear(parseInt(value))}
              style={{ width: '4rem', padding: '0.3rem' }}
            >
              {years.map((year) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="flex space-x-1">
            <Button
              type="minimal"
              className="border border-gray-300 py-1"
              onClick={decreaseMonth}
            >
              <Icon element={MdKeyboardArrowLeft} />
            </Button>

            <Button
              type="minimal"
              className="border border-gray-300 py-1"
              onClick={increaseMonth}
            >
              <Icon element={MdKeyboardArrowRight} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ReactDatePicker
      portalId="root"
      id={props.id}
      selected={date}
      showPopperArrow={false}
      required={props.required}
      disabled={props.disabled}
      onMonthChange={(newDate) => handleOnValueChange(newDate)}
      onYearChange={(newDate) => handleOnValueChange(newDate)}
      renderCustomHeader={CustomHeaderArea}
      customInput={createElement(forwardRef(CustomInputArea))}
      minDate={props.minDate ? new Date(props.minDate) : null}
      onChange={(newDate) => handleOnValueChange(newDate)}
      formatWeekDay={(date) => {
        return weekdaysShort[date.toString() as keyof typeof weekdaysShort];
      }}
      isClearable
      clearButtonClassName={`mr-1 after:bg-[${accentColor}] after:content-['x']`}
      todayButton={t('today')}
    />
  );
}
