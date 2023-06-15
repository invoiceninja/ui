/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { ChangeEvent, useEffect, useState } from 'react';
import { Calendar } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { DatePicker } from 'antd';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { SelectField } from './forms';

type Props = {
  startDate: string;
  endDate: string;
  handleDateChange: any;
};

export function DropdownDateRangePicker(props: Props) {
  const [t] = useTranslation();
  const [isOpenModal, setisOpenModal] = useState(false);
  const { RangePicker } = DatePicker;

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);

  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();

  const { dateFormat } = useCurrentCompanyDateFormats();

  useEffect(() => {
    setCustomStartDate(props.startDate);
    setCustomEndDate(props.endDate);
  }, [props.startDate, props.endDate]);

  const handleCustomDateChange = (value: [string, string]) => {
    dayjs.extend(customParseFormat)
    if (value[0] === '' || value[1] === '') {
      return;
    }

    props.handleDateChange(dayjs(value[0]).format('YYYY-MM-DD') + ',' + dayjs(value[1]).format('YYYY-MM-DD'));
  }

  return (
    <div className="flex justify-end items-center">
      <Calendar className="mx-2" />{' '}
      <SelectField
        defaultValue={props.startDate + '/' + props.startDate}
        className={
          'appearance-none block px-3 py-1.5 text-base font-normal  text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none'
        }
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          event.preventDefault();
          if (event.target.value === 'Custom') {
            setisOpenModal(true);
          } else {
            setisOpenModal(false);
            props.handleDateChange(event.target.value);
          }
        }}
        style={{ width: '9.7rem' }}
      >
        <option
          value={[
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
              .toISOString()
              .split('T')[0],
            now.toISOString().split('T')[0],
          ]}
        >
          {t('last_7_days')}
        </option>
        <option
          value={[
            new Date(new Date().setDate(now.getDate() - 30))
              .toISOString()
              .split('T')[0],
            now.toISOString().split('T')[0],
          ]}
        >
          {t('last_30_days')}
        </option>
        <option
          value={[
            new Date(now.getFullYear(), now.getMonth(), 2)
              .toISOString()
              .split('T')[0],
            new Date(now.getFullYear(), now.getMonth() + 1, 1)
              .toISOString()
              .split('T')[0],
          ]}
        >
          {t('this_month')}
        </option>
        <option
          value={[
            new Date(
              now.getFullYear() - (now.getMonth() > 0 ? 0 : 1),
              (now.getMonth() - 1 + 12) % 12,
              1
            )
              .toISOString()
              .split('T')[0],
            new Date(now.getFullYear(), now.getMonth(), 0)
              .toISOString()
              .split('T')[0],
          ]}
        >
          {t('last_month')}
        </option>
        <option
          value={[
            new Date(now.getFullYear(), quarter * 3, 1)
              .toISOString()
              .split('T')[0],
            new Date(
              new Date(now.getFullYear(), quarter * 3, 1).getFullYear(),
              new Date(now.getFullYear(), quarter * 3, 1).getMonth() + 3,
              0
            )
              .toISOString()
              .split('T')[0],
          ]}
        >
          {t('current_quarter')}
        </option>
        <option
          value={[
            new Date(now.getFullYear(), quarter * 3 - 3, 1)
              .toISOString()
              .split('T')[0],
            new Date(
              new Date(now.getFullYear(), quarter * 3 - 3, 1).getFullYear(),
              new Date(now.getFullYear(), quarter * 3 - 3, 1).getMonth() + 3,
              0
            )
              .toISOString()
              .split('T')[0],
          ]}
        >
          {t('last_quarter')}
        </option>
        <option
          value={[
            new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
            new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
          ]}
        >
          {t('this_year')}
        </option>
        <option
          value={[
            new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
            new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0],
          ]}
        >
          {t('last_year')}
        </option>
        <option value={'Custom'}>{`${t('custom_range')}`}</option>
      </SelectField>
      {isOpenModal && (
        <div className="flex flex-row space-x-2">
          <RangePicker
            size="large"
            defaultValue={[dayjs(customStartDate), dayjs(customEndDate)]}
            format={dateFormat}
            onChange={(dates, dateString) => handleCustomDateChange(dateString)}
          />
        </div>
      )}
    </div>
  );
}
