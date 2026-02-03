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
import { useEffect, useRef, useState } from 'react';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Tippy from '@tippyjs/react/headless';
import { Icon } from '../icons/Icon';
import { Calendar } from 'react-feather';
import { useClickAway } from 'react-use';
import { useColorScheme } from '$app/common/colors';
import { emitter } from '$app';

interface Props {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onClick: () => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  onClick,
}: Props) {
  const divRef = useRef(null);

  const { RangePicker } = DatePicker;

  const colors = useColorScheme();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [internalEndDate, setInternalEndDate] = useState<string>(endDate);
  const [internalStartDate, setInternalStartDate] = useState<string>(startDate);
  const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);

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

    setInternalStartDate(start);
    setInternalEndDate(end);

    if ((start.length && end.length) || (!start.length && !end.length)) {
      onDateRangeChange(start, end);
    }
  };

  const isCurrentDateRangeActive = () => {
    return Boolean(
      startDate && startDate.length > 0 && endDate && endDate.length > 0
    );
  };

  useEffect(() => {
    setInternalStartDate(startDate);
    setInternalEndDate(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    emitter.on('date_range_picker.clear', () => {
      setInternalStartDate('');
      setInternalEndDate('');
      onDateRangeChange('', '');
    });
  }, []);

  return (
    <div ref={divRef}>
      <Tippy
        visible={isVisible}
        placement="bottom"
        interactive={true}
        popperOptions={{ strategy: 'fixed' }}
        render={() => (
          <div
            className="flex flex-col p-3"
            style={{
              backgroundColor: colors.$2,
              border: `1px solid ${colors.$5}`,
              width: 300,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <ConfigProvider locale={antdLocale?.default}>
              <RangePicker
                size="large"
                value={[
                  internalStartDate.length > 0
                    ? dayjs(internalStartDate)
                    : null,
                  internalEndDate.length > 0 ? dayjs(internalEndDate) : null,
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
            color={isCurrentDateRangeActive() ? '#22c55e' : colors.$17}
            style={{ width: '1.4rem', height: '1.4rem' }}
          />
        </div>
      </Tippy>
    </div>
  );
}
