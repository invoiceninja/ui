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
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Tippy from '@tippyjs/react/headless';
import { Icon } from '../icons/Icon';
import { Calendar } from 'react-feather';
import { useClickAway } from 'react-use';
import { useColorScheme } from '$app/common/colors';

interface Props {
  setDateRange: Dispatch<SetStateAction<string>>;
  onClick: () => void;
}
export function DateRangePicker(props: Props) {
  const divRef = useRef(null);

  const { RangePicker } = DatePicker;

  const colors = useColorScheme();

  const { setDateRange, onClick } = props;

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);

  const [currentDateRange, setCurrentDateRange] = useState<string>('');

  const antdLocale = useAtomValue(antdLocaleAtom);
  const { dateFormat } = useCurrentCompanyDateFormats();

  useClickAway(divRef, () => {
    isVisible && !isCalendarVisible && setIsVisible(false);
  });

  const handleChangeValue = (value: [string, string]) => {
    dayjs.extend(customParseFormat);

    const unsupportedFormats = ['DD. MMM. YYYY', 'ddd MMM D, YYYY'];

    const start = value[0]
      ? dayjs(
          value[0],
          !unsupportedFormats.includes(dateFormat) ? dateFormat : undefined,
          antdLocale?.locale
        ).format('YYYY-MM-DD')
      : '';

    const end = value[1]
      ? dayjs(
          value[1],
          !unsupportedFormats.includes(dateFormat) ? dateFormat : undefined,
          antdLocale?.locale
        ).format('YYYY-MM-DD')
      : '';

    setCurrentDateRange(start || end ? [start, end].join(',') : '');

    setDateRange(start || end ? [start, end].join(',') : '');
  };

  const isCurrentDateRangeActive = () => {
    const startDate = currentDateRange?.split(',')?.[0];
    const endDate = currentDateRange?.split(',')?.[1];

    return Boolean(startDate && endDate);
  };

  useEffect(() => {
    if (isVisible) {
      const startDate = currentDateRange?.split(',')?.[0];
      const endDate = currentDateRange?.split(',')?.[1];

      setDateRange(
        currentDateRange?.length > 1 ? [startDate, endDate].join(',') : ''
      );
    }
  }, [isVisible]);

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
                  currentDateRange?.split(',')?.[0]
                    ? dayjs(currentDateRange.split(',')[0])
                    : null,
                  currentDateRange?.split(',')?.[1]
                    ? dayjs(currentDateRange.split(',')[1])
                    : null,
                ]}
                format={dateFormat}
                onCalendarChange={(_, dateString) =>
                  handleChangeValue(dateString)
                }
                onOpenChange={(value) => setIsCalendarVisible(value)}
              />
            </ConfigProvider>
          </div>
        )}
      >
        <div
          className="cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();

            onClick();

            setIsVisible((current) => !current);
          }}
        >
          <Icon
            element={Calendar}
            color={isCurrentDateRangeActive() ? 'lightgreen' : 'white'}
            style={{ width: '1.4rem', height: '1.4rem' }}
          />
        </div>
      </Tippy>
    </div>
  );
}
