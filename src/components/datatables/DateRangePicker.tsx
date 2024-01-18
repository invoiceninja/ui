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
import { useColorScheme } from '$app/common/colors';

interface Props {
  dateRange: string;
  setDateRange: Dispatch<SetStateAction<string>>;
  onValueChanged: () => void;
}
export function DateRangePicker(props: Props) {
  const divRef = useRef(null);

  const { RangePicker } = DatePicker;

  const colors = useColorScheme();

  const { dateRange, setDateRange, onValueChanged } = props;

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

    const start = value[0]
      ? dayjs(value[0], dateFormat, antdLocale?.locale).format('YYYY-MM-DD')
      : '';

    const end = value[1]
      ? dayjs(value[1], dateFormat, antdLocale?.locale).format('YYYY-MM-DD')
      : '';

    setDateRange([start, end].join(','));

    onValueChanged();
  };

  return (
    <div ref={divRef}>
      <Tippy
        visible={isVisible}
        placement="bottom"
        interactive={true}
        render={() => (
          <div
            className="flex flex-col p-3"
            style={{
              backgroundColor: colors.$2,
              border: `1px solid ${colors.$5}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <ConfigProvider locale={antdLocale?.default}>
              <RangePicker
                size="large"
                value={[
                  dateRange.split(',')[0]
                    ? dayjs(dateRange.split(',')[0])
                    : null,
                  dateRange.split(',')[1]
                    ? dayjs(dateRange.split(',')[1])
                    : null,
                ]}
                format={dateFormat}
                onCalendarChange={(_, dateString) =>
                  handleChangeValue(dateString)
                }
              />
            </ConfigProvider>
          </div>
        )}
      >
        <div
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();

            setIsVisible((current) => !current);
          }}
        >
          <Icon
            element={Calendar}
            color="white"
            style={{ width: '1.4rem', height: '1.4rem' }}
          />
        </div>
      </Tippy>
    </div>
  );
}
