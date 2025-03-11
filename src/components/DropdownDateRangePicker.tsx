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
import styled from 'styled-components';

type Props = {
  value?: string;
  startDate: string;
  endDate: string;
  handleDateChange: (value: string) => unknown;
  handleDateRangeChange: (value: string) => unknown;
};

export const antdLocaleAtom = atom<any | null>(null);

const { RangePicker } = DatePicker;

const StyledRangePicker = styled(RangePicker)`
  &:focus {
    border: none;
    outline: none;
  }

  &.ant-picker {
    border-color: var(--picker-border-color);
    width: 16rem;
    height: 2.5rem;
    background-color: var(--picker-bg);
  }

  &.ant-picker-focused {
    border-color: var(--accent-color) !important;
    box-shadow: none !important;
  }

  .ant-picker-suffix {
    display: none;
  }

  .ant-picker-input {
    text-align: center;
    display: flex;
    justify-content: center;
  }

  .ant-picker-input input {
    text-align: center;
    justify-content: center;
    color: var(--input-text-color) !important;
  }

  .ant-picker-input-active {
    background-color: var(--active-state-bg);
    border-radius: 4px;
  }

  .ant-picker-input-active input {
    color: var(--accent-color);
    font-weight: 500;
  }

  &.ant-picker-range-active .ant-picker-input-active input {
    color: var(--accent-color);
  }

  .ant-picker-range-separator {
    display: flex;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .ant-picker-active-bar {
    display: none !important;
  }

  .ant-picker-panels {
    display: flex;
    flex-direction: row;
  }

  .ant-picker-panel {
    border: none;
    background-color: var(--calendar-bg);
  }

  .ant-picker-date-panel,
  .ant-picker-datetime-panel,
  .ant-picker-time-panel {
    width: auto;
  }

  .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
    background-color: var(--accent-color);
  }

  .ant-picker-cell-in-view.ant-picker-cell-in-range::before {
    background-color: var(--active-state-bg);
  }

  .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
  .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
    background-color: var(--accent-color);
    color: var(--calendar-bg);
  }

  .ant-picker-header-view button {
    color: var(--input-text-color);
  }

  .ant-picker-header-view button:hover {
    color: var(--accent-color);
  }

  &:not(.ant-picker-focused) .ant-picker-input input {
    background-color: transparent;
    color: var(--input-text-color) !important;
    font-weight: normal;
  }

  &:not(.ant-picker-focused):not(.ant-picker-range-active)
    .ant-picker-input-active {
    background-color: transparent;
  }

  &:not(.ant-picker-focused) .ant-picker-active-bar {
    display: none;
  }
`;

export function DropdownDateRangePicker(props: Props) {
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

  useEffect(() => {
    return () => {
      setIsModalVisible(false);
    };
  }, []);

  return (
    <div className="flex justify-end items-center">
      <SelectField
        className="rounded-md shadow-sm"
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
        {...(props.value === 'custom' && {
          controlStyle: {
            borderTopRightRadius: '0',
            borderBottomRightRadius: '0',
            borderRight: 'none',
          },
        })}
      >
        <option value="last7_days">{t('last_7_days')}</option>
        <option value="last30_days">{t('last_30_days')}</option>
        <option value="this_month">{t('this_month')}</option>
        <option value="last_month">{t('last_month')}</option>
        <option value="last_quarter">{t('last_quarter')}</option>
        <option value="this_quarter">{t('current_quarter')}</option>
        <option value="this_year">{t('this_year')}</option>
        <option value="last_year">{t('last_year')}</option>
        <option value="last365_days">{t('last365_days')}</option>
        <option value="custom">{t('custom')}</option>
      </SelectField>

      {isModalVisible && (
        <div
          className="flex flex-row space-x-2"
          style={
            {
              '--accent-color': colors.$3,
              '--active-state-bg': colors.$4,
              '--calendar-bg': colors.$2,
              '--input-text-color': colors.$3,
              '--picker-border-color': colors.$5,
              '--picker-bg': colors.$1,
            } as React.CSSProperties
          }
        >
          <ConfigProvider locale={antdLocale?.default}>
            <StyledRangePicker
              size="large"
              className="rounded-md"
              defaultValue={[dayjs(customStartDate), dayjs(customEndDate)]}
              format={dateFormat}
              onChange={(_, dateString) => handleCustomDateChange(dateString)}
              style={{
                borderTopLeftRadius: '0',
                borderBottomLeftRadius: '0',
              }}
              separator={<span style={{ color: colors.$4 }}>—</span>}
              allowClear={false}
            />
          </ConfigProvider>
        </div>
      )}
    </div>
  );
}
