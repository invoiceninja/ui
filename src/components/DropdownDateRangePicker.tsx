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
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { SelectField } from './forms';

type Props = {
  startDate: string;
  endDate: string;
  handleDateChange: (value: string) => unknown;
  handleDateRangeChange: (value: string) => unknown;
};

export function DropdownDateRangePicker(props: Props) {
  const [t] = useTranslation();
  const [isOpenModal, setisOpenModal] = useState(false);
  const { RangePicker } = DatePicker;

  // const now = new Date();
  // const quarter = Math.floor(now.getMonth() / 3);

  const [customStartDate, setCustomStartDate] = useState<string>();
  const [customEndDate, setCustomEndDate] = useState<string>();

  const { dateFormat } = useCurrentCompanyDateFormats();

  useEffect(() => {
    setCustomStartDate(props.startDate);
    setCustomEndDate(props.endDate);
  }, [props.startDate, props.endDate]);

  const handleCustomDateChange = (value: [string, string]) => {
    dayjs.extend(customParseFormat);
    if (value[0] === '' || value[1] === '') {
      return;
    }

    props.handleDateChange(
      dayjs(value[0]).format('YYYY-MM-DD') +
        ',' +
        dayjs(value[1]).format('YYYY-MM-DD')
    );
  };

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
          if (event.target.value === 'custom') {
            setisOpenModal(true);
          } else {
            setisOpenModal(false);
            props.handleDateRangeChange(event.target.value);
          }
        }}
        style={{ width: '9.7rem' }}
      >
        last365_days,,,,,this_year,last_year,all_time,custom
        <option value="last7_days">{t('last_7_days')}</option>
        <option value="last30_days">{t('last_30_days')}</option>
        <option value="this_month">{t('this_month')}</option>
        <option value="last_month">{t('last_month')}</option>
        <option value="this_quarter">{t('current_quarter')}</option>
        <option value="last_quarter">{t('last_quarter')}</option>
        <option value="this_year">{t('this_year')}</option>
        <option value="last_year">{t('last_year')}</option>
        <option value={'last365_days'}>{`${t('last365_days')}`}</option>
        <option value={'custom'}>{`${t('custom')}`}</option>
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
