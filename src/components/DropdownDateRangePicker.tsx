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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigProvider, DatePicker } from 'antd';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { SelectField } from './forms';
import { atom, useAtomValue } from 'jotai';
import { Calendar } from './icons/Calendar';
import { useColorScheme } from '$app/common/colors';

type Props = {
  value?: string;
  startDate: string;
  endDate: string;
  handleDateChange: (value: string) => unknown;
  handleDateRangeChange: (value: string) => unknown;
};

export const antdLocaleAtom = atom<any | null>(null);

export function DropdownDateRangePicker(props: Props) {
  const { RangePicker } = DatePicker;
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const antdLocale = useAtomValue(antdLocaleAtom);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [customEndDate, setCustomEndDate] = useState<string>();
  const [customStartDate, setCustomStartDate] = useState<string>();

  const handleCustomDateChange = (value: [string, string]) => {
    dayjs.extend(customParseFormat);
    if (value[0] === '' || value[1] === '') {
      return;
    }

    const unsupportedFormats = ['DD. MMM. YYYY', 'ddd MMM D, YYYY'];

    props.handleDateChange(
      dayjs(
        value[0],
        !unsupportedFormats.includes(dateFormat) ? dateFormat : undefined,
        antdLocale?.locale
      ).format('YYYY-MM-DD') +
        ',' +
        dayjs(
          value[1],
          !unsupportedFormats.includes(dateFormat) ? dateFormat : undefined,
          antdLocale?.locale
        ).format('YYYY-MM-DD')
    );
  };

  useEffect(() => {
    setCustomStartDate(props.startDate);
    setCustomEndDate(props.endDate);
  }, [props.startDate, props.endDate]);

  return (
    <div className="flex justify-end items-center">
      <SelectField
        className="rounded-md"
        value={props.value}
        onValueChange={(value) => {
          value === 'custom'
            ? setIsModalVisible(true)
            : setIsModalVisible(false);

          props.handleDateRangeChange(value);
        }}
        style={{ width: '9.7rem', borderRadius: '0.375rem' }}
        customSelector
        dismissable={false}
        withoutSeparator
        searchable={false}
        controlIcon={<Calendar color={colors.$3} />}
      >
        <option value="last7_days">{t('last_7_days')}</option>
        <option value="last30_days">{t('last_30_days')}</option>
        <option value="this_month">{t('this_month')}</option>
        <option value="this_year">{t('this_year')}</option>
        <option value="last_year">{t('last_year')}</option>
        <option value={'last365_days'}>{`${t('last365_days')}`}</option>
        <option value={'custom'}>{`${t('custom')}`}</option>
      </SelectField>

      {isModalVisible && (
        <div className="flex flex-row space-x-2">
          <ConfigProvider locale={antdLocale?.default}>
            <RangePicker
              size="large"
              defaultValue={[dayjs(customStartDate), dayjs(customEndDate)]}
              format={dateFormat}
              onChange={(_, dateString) => handleCustomDateChange(dateString)}
            />
          </ConfigProvider>
        </div>
      )}
    </div>
  );
}
