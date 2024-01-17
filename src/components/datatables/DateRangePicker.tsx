/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ConfigProvider, DatePicker } from 'antd';
import { useAtomValue } from 'jotai';
import { antdLocaleAtom } from '../DropdownDateRangePicker';
import dayjs from 'dayjs';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Tippy from '@tippyjs/react/headless';
import { Icon } from '../icons/Icon';
import { Calendar } from 'react-feather';
import { useClickAway } from 'react-use';
import { DateRangeProperty } from '../DataTable';
import { Button } from '../forms';
import { useColorScheme } from '$app/common/colors';

interface Props {
  dateRange: string;
  setDateRange: Dispatch<SetStateAction<string>>;
  dateRangeProperties?: DateRangeProperty[];
  dateRangeProperty: string;
  setDateRangeProperty: Dispatch<SetStateAction<string>>;
}
export function DateRangePicker(props: Props) {
  const divRef = useRef(null);

  const { RangePicker } = DatePicker;

  const colors = useColorScheme();

  const {
    dateRange,
    setDateRange,
    dateRangeProperties,
    dateRangeProperty,
    setDateRangeProperty,
  } = props;

  const [isVisible, setIsVisible] = useState<boolean>(false);

  const antdLocale = useAtomValue(antdLocaleAtom);
  const { dateFormat } = useCurrentCompanyDateFormats();

  useClickAway(divRef, () => {
    setTimeout(() => {
      isVisible && setIsVisible(false);
    }, 200);
  });

  const handleChangeValue = (value: [string, string]) => {
    dayjs.extend(customParseFormat);

    if (value[0] === '' || value[1] === '') {
      return;
    }

    setDateRange(
      dayjs(value[0], dateFormat, antdLocale?.locale).format('YYYY-MM-DD') +
        ',' +
        dayjs(value[1], dateFormat, antdLocale?.locale).format('YYYY-MM-DD')
    );
  };

  return (
    <div ref={divRef}>
      <Tippy
        visible={isVisible}
        placement="bottom"
        interactive={true}
        render={() => (
          <div
            className="flex flex-col space-y-4 p-4"
            style={{
              backgroundColor: colors.$2,
              border: `1px solid ${colors.$5}`,
            }}
          >
            <div className="flex justify-between">
              {dateRangeProperties?.map(({ value, label }) => (
                <Button
                  key={value}
                  behavior="button"
                  type={dateRangeProperty === value ? 'primary' : 'secondary'}
                  onClick={() => setDateRangeProperty(value)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <ConfigProvider locale={antdLocale?.default}>
              <RangePicker
                size="large"
                value={[
                  dayjs(dateRange.split(',')[0]),
                  dayjs(dateRange.split(',')[1]),
                ]}
                format={dateFormat}
                onChange={(_, dateString) => handleChangeValue(dateString)}
              />
            </ConfigProvider>
          </div>
        )}
      >
        <div
          className="cursor-pointer"
          onClick={() => setIsVisible((current) => !current)}
        >
          <Icon element={Calendar} />
        </div>
      </Tippy>
    </div>
  );
}
