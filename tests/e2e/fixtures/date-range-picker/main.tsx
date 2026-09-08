import { ConfigProvider, DatePicker } from 'antd';
import type { Locale } from 'antd/es/locale';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  type SerializedDateRange,
  serializeCompleteDateRange,
  serializeDateRange,
  serializeOrderedDateRange,
} from '$app/common/helpers/dateRange';
import { useResolveAntdLocale } from '$app/common/hooks/useResolveAntdLocale';
import { useResolveDayJSLocale } from '$app/common/hooks/useResolveDayJSLocale';
import { DATE_FORMATS, EXPECTED_RANGE } from './matrix';

const { RangePicker } = DatePicker;

interface DateResult {
  isDayjs: boolean;
  isValid: boolean;
  isoDate: string;
}

interface RangePickerResult {
  antdPickerLocale: string;
  callbackDates: DateResult[];
  callbackDisplayDates: string[];
  configProviderLocale: string;
  dateStrings: string[];
  dayjsLocale: string;
  localeKeys: string[];
  persistedDates: DateResult[];
  persistedStrings: SerializedDateRange;
}

interface SerializerResult {
  cleared: SerializedDateRange;
  ordered: SerializedDateRange | null;
  partial: SerializedDateRange;
}

function describeDate(date: Dayjs): DateResult {
  return {
    isDayjs: dayjs.isDayjs(date),
    isValid: date.isValid(),
    isoDate: date.format('YYYY-MM-DD'),
  };
}

function DateRangePickerFixture() {
  const locale =
    new URLSearchParams(window.location.search).get('locale') ?? 'en';
  const resolveAntdLocale = useResolveAntdLocale();
  const resolveDayJSLocale = useResolveDayJSLocale();

  const [antdLocale, setAntdLocale] = useState<Locale | null>(null);
  const [dateFormat, setDateFormat] = useState<string>(DATE_FORMATS[0]);
  const [persistedRange, setPersistedRange] =
    useState<SerializedDateRange | null>(null);
  const [calendarRange, setCalendarRange] =
    useState<SerializedDateRange | null>(null);
  const [calendarChanges, setCalendarChanges] = useState<SerializedDateRange[]>(
    []
  );
  const [result, setResult] = useState<RangePickerResult | null>(null);
  const [serializerResult, setSerializerResult] =
    useState<SerializerResult | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');

  useEffect(() => {
    let isCurrent = true;

    Promise.all([resolveDayJSLocale(locale), resolveAntdLocale(locale)]).then(
      ([resolvedDayJSLocale, resolvedAntdLocale]) => {
        if (!isCurrent) {
          return;
        }

        dayjs.locale(resolvedDayJSLocale);
        setAntdLocale(resolvedAntdLocale);
        setStatus('ready');
      }
    );

    return () => {
      isCurrent = false;
    };
  }, [locale]);

  const handleChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    const serializedRange = serializeCompleteDateRange(dates);

    if (!antdLocale || !serializedRange || !dates?.[0] || !dates[1]) {
      return;
    }

    const callbackDates = [describeDate(dates[0]), describeDate(dates[1])];
    const persistedDates = serializedRange.map((date) =>
      describeDate(dayjs(date))
    );

    setPersistedRange(serializedRange);

    setResult({
      antdPickerLocale: antdLocale.DatePicker?.lang.locale ?? '',
      callbackDates,
      callbackDisplayDates: [
        dates[0].format(dateFormat),
        dates[1].format(dateFormat),
      ],
      configProviderLocale: antdLocale.locale,
      dateStrings,
      dayjsLocale: dayjs.locale(),
      localeKeys: Object.keys(antdLocale),
      persistedDates,
      persistedStrings: serializedRange,
    });
  };

  const handleCalendarChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    const serializedRange = serializeDateRange(dates);

    setCalendarRange(serializedRange);
    setCalendarChanges((current) => [...current, serializedRange]);
  };

  return (
    <main>
      <label>
        Date format
        <select
          aria-label="Date format"
          value={dateFormat}
          onChange={(event) => {
            setDateFormat(event.target.value);
            setPersistedRange(null);
            setResult(null);
          }}
        >
          {DATE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </label>

      <div data-testid="locale-status">{status}</div>

      {status === 'ready' && antdLocale && (
        <ConfigProvider locale={antdLocale}>
          <RangePicker
            key={dateFormat}
            data-testid="date-range-picker"
            format={dateFormat}
            value={
              persistedRange
                ? [dayjs(persistedRange[0]), dayjs(persistedRange[1])]
                : null
            }
            onChange={handleChange}
            presets={[
              {
                label: 'Test range',
                value: [dayjs(EXPECTED_RANGE[0]), dayjs(EXPECTED_RANGE[1])],
              },
            ]}
          />

          <RangePicker
            data-testid="calendar-range-picker"
            defaultPickerValue={[
              dayjs(EXPECTED_RANGE[0]),
              dayjs(EXPECTED_RANGE[1]),
            ]}
            value={
              calendarRange
                ? [
                    calendarRange[0] ? dayjs(calendarRange[0]) : null,
                    calendarRange[1] ? dayjs(calendarRange[1]) : null,
                  ]
                : null
            }
            onCalendarChange={handleCalendarChange}
          />
        </ConfigProvider>
      )}

      <output data-testid="date-range-result">
        {result ? JSON.stringify(result) : ''}
      </output>

      <output data-testid="calendar-change-result">
        {JSON.stringify(calendarChanges)}
      </output>

      <button
        data-testid="exercise-serializers"
        type="button"
        onClick={() =>
          setSerializerResult({
            cleared: serializeDateRange(null),
            ordered: serializeOrderedDateRange([
              dayjs(EXPECTED_RANGE[1]),
              dayjs(EXPECTED_RANGE[0]),
            ]),
            partial: serializeDateRange([dayjs(EXPECTED_RANGE[0]), null]),
          })
        }
      >
        Exercise production serializers
      </button>

      <output data-testid="serializer-result">
        {serializerResult ? JSON.stringify(serializerResult) : ''}
      </output>
    </main>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Date range picker fixture root was not found');
}

createRoot(root).render(<DateRangePickerFixture />);
