import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import CommonProps from '$app/common/interfaces/common-props.interface';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useState, useRef, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { MdOutlineAvTimer } from 'react-icons/md';
import { useClickAway } from 'react-use';
import { Icon } from '../icons/Icon';
import { TimePickerColumn } from './TimePickerColumn';

interface Props extends CommonProps {
  id?: string;
  required?: boolean;
  value: number;
  onValueChange?: (value: string) => unknown;
}

export enum TimeSection {
  HOURS = 0,
  MINUTES = 1,
  SECONDS = 2,
  PERIOD = 3,
}

const SECTION_RANGE = [
  [0, 2],
  [3, 5],
  [6, 8],
  [9, 11],
];

export function TimePicker(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);

  const { timeFormatId, timeFormat } = useCompanyTimeFormat();

  const [visibleTimerSelection, setVisibleTimerSelection] =
    useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [timeValue, setTimeValue] = useState<string>('--:--:--');

  useClickAway(containerRef, () => {
    visibleTimerSelection && setVisibleTimerSelection(false);
    setSelectedSection(null);
  });

  const isTwelveHourFormat = () => {
    return timeFormatId === 12;
  };

  useEffect(() => {
    if (props.value > 0) {
      setTimeValue(dayjs.unix(props.value).format(timeFormat));
    } else {
      if (isTwelveHourFormat()) {
        setTimeValue('--:--:-- PM');
      } else {
        setTimeValue('--:--:--');
      }
    }
  }, [props.value, timeFormatId]);

  const getValueOfSection = (
    section: TimeSection,
    inStringFormat?: boolean
  ) => {
    const sectionRange = SECTION_RANGE[section];

    const start = sectionRange[0];
    const end = sectionRange[1];

    const slicedValue = timeValue.slice(start, end);

    return section !== TimeSection.PERIOD && !inStringFormat
      ? parseInt(slicedValue)
      : slicedValue;
  };

  const handleChangeSection = () => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;

      if (typeof start === 'number') {
        const numberOfSections = isTwelveHourFormat() ? 4 : 3;

        const currentSectionIndex = selectedSection ?? 0;
        const nextSectionIndex = (currentSectionIndex + 1) % numberOfSections;
        const nextStart = nextSectionIndex * 3;
        const nextEnd = nextStart + 2;

        inputRef.current.setSelectionRange(nextStart, nextEnd);
        setSelectedSection(nextSectionIndex);
      }
    }
  };

  useEffect(() => {
    const hours = getValueOfSection(TimeSection.HOURS, true) as string;
    const minutes = getValueOfSection(TimeSection.MINUTES, true) as string;

    if (parseInt(hours) >= 0 && parseInt(minutes) >= 0) {
      let customValue = `${hours}:${minutes}`;
      let customFormat = 'HH:mm';

      const seconds = getValueOfSection(TimeSection.SECONDS, true) as string;

      if (parseInt(seconds) >= 0) {
        customValue += `:${seconds}`;
        customFormat += ':ss';
      }

      if (isTwelveHourFormat()) {
        customValue += ` ${getValueOfSection(TimeSection.PERIOD)}`;
      }

      const formattedCustomValue = dayjs(
        `${new Date().toDateString()} ${customValue}`
      ).format(customFormat);

      props.onValueChange?.(formattedCustomValue);
    }

    handleChangeSection();
  }, [timeValue]);

  const getCharWidth = (font: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      context.font = font;
      return context.measureText('a').width;
    }

    return 0;
  };

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    setVisibleTimerSelection(false);

    if (inputRef.current) {
      const inputStyle = window.getComputedStyle(inputRef.current);
      const font = `${inputStyle.fontSize} ${inputStyle.fontFamily}`;
      const charWidth = getCharWidth(font);

      const bounds = inputRef.current.getBoundingClientRect();

      const clickX = event.pageX - bounds.left;

      const index = clickX / charWidth;

      if (index < 3.5) {
        inputRef.current.setSelectionRange(0, 2);
        setSelectedSection(0);
      } else if (index < 5.7) {
        inputRef.current.setSelectionRange(3, 5);
        setSelectedSection(1);
      } else if (index < 7.7) {
        inputRef.current.setSelectionRange(6, 8);
        setSelectedSection(2);
      } else if (index > 7.7 && index <= 12 && isTwelveHourFormat()) {
        inputRef.current.setSelectionRange(9, 11);
        setSelectedSection(3);
      } else {
        inputRef.current.setSelectionRange(0, 2);
        setSelectedSection(0);
      }
    }
  };

  const isSelected = (section: TimeSection, value: string) => {
    return getValueOfSection(section, true) === value;
  };

  const handleChange = (
    value: string,
    section?: number,
    popperChange?: boolean
  ) => {
    if (selectedSection === null && !popperChange) return;

    const sectionIndex =
      typeof section === 'number' ? section : selectedSection ?? 0;

    const sectionRange = SECTION_RANGE[sectionIndex];

    const start = sectionRange[0];
    const end = sectionRange[1];

    const currentSectionValue = timeValue.slice(start, end);

    if (popperChange) {
      const updatedTimeValue =
        timeValue.substring(0, start) + value + timeValue.substring(end);

      setTimeValue(updatedTimeValue);

      return;
    }

    if (selectedSection === TimeSection.PERIOD) {
      const updatedTimeValue =
        timeValue.substring(0, start) + value + timeValue.substring(end);

      setTimeValue(updatedTimeValue);

      return;
    }

    if (
      currentSectionValue === '--' ||
      parseInt(currentSectionValue) > 9 ||
      parseInt(currentSectionValue) === 0
    ) {
      const numberValue = '0' + value;

      const updatedTimeValue =
        timeValue.substring(0, start) + numberValue + timeValue.substring(end);

      setTimeValue(updatedTimeValue);
    } else {
      let numberValue = (
        parseInt(timeValue[end - 1]) * 10 +
        parseInt(value)
      ).toString();

      if (selectedSection === TimeSection.HOURS) {
        if (isTwelveHourFormat() && parseInt(numberValue) > 11) {
          numberValue = '0' + value;
        }

        if (!isTwelveHourFormat() && parseInt(numberValue) > 23) {
          numberValue = '0' + value;
        }
      }

      if (
        (selectedSection === TimeSection.MINUTES ||
          selectedSection === TimeSection.SECONDS) &&
        parseInt(numberValue) > 59
      ) {
        numberValue = '0' + value;
      }

      const updatedTimeValue =
        timeValue.substring(0, start) + numberValue + timeValue.substring(end);

      setTimeValue(updatedTimeValue);

      return updatedTimeValue;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const value = event.key.toLowerCase();

    if (inputRef.current) {
      const isDigit = event.code.includes('Digit');
      const isCorrectChar = value === 'a' || value === 'p';
      const isTab = event.key === 'Tab';

      let updatedTimeValue = '';

      if (isDigit && selectedSection !== TimeSection.PERIOD) {
        updatedTimeValue = handleChange(value) ?? '';
      }

      if (isTwelveHourFormat() && isCorrectChar) {
        const timePeriod = value === 'a' ? 'AM' : 'PM';

        updatedTimeValue = handleChange(timePeriod) ?? '';
      }

      if (isTab || updatedTimeValue === timeValue) {
        handleChangeSection();
      }
    }
  };

  return (
    <div ref={containerRef}>
      <Tippy
        placement="bottom"
        interactive={true}
        visible={visibleTimerSelection}
        render={() => (
          <div
            className={classNames(
              'box grid gap-1 rounded-sm bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-40 focus:outline-none p-1 h-64',
              {
                'grid-cols-3': !isTwelveHourFormat(),
                'grid-cols-4': isTwelveHourFormat(),
              }
            )}
          >
            <TimePickerColumn
              key="hoursSection"
              handleChange={handleChange}
              isSelected={isSelected}
              section={TimeSection.HOURS}
            />

            <TimePickerColumn
              key="minutesSection"
              handleChange={handleChange}
              isSelected={isSelected}
              section={TimeSection.MINUTES}
            />

            <TimePickerColumn
              key="secondsSection"
              handleChange={handleChange}
              isSelected={isSelected}
              section={TimeSection.SECONDS}
            />

            {isTwelveHourFormat() && (
              <div className="flex flex-col">
                <div
                  key="am"
                  className={classNames(
                    'flex items-center justify-center px-4 py-2 cursor-pointer',
                    {
                      'bg-gray-500 text-white': isSelected(
                        TimeSection.PERIOD,
                        'AM'
                      ),
                      'hover:bg-gray-200': !isSelected(
                        TimeSection.PERIOD,
                        'AM'
                      ),
                    }
                  )}
                  onClick={() => handleChange('AM', TimeSection.PERIOD, true)}
                >
                  AM
                </div>

                <div
                  key="pm"
                  className={classNames(
                    'flex items-center justify-center px-4 py-2 cursor-pointer',
                    {
                      'bg-gray-500 text-white': isSelected(
                        TimeSection.PERIOD,
                        'PM'
                      ),
                      'hover:bg-gray-200': !isSelected(
                        TimeSection.PERIOD,
                        'PM'
                      ),
                    }
                  )}
                  onClick={() => handleChange('PM', TimeSection.PERIOD, true)}
                >
                  PM
                </div>
              </div>
            )}
          </div>
        )}
      >
        <div className="flex items-center justify-end">
          <input
            type="text"
            readOnly
            ref={inputRef}
            className={`w-full py-2 px-3 rounded text-sm border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-transparent dark:text-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed ${props.className}`}
            value={timeValue}
            onClick={handleClick}
            onFocus={() => {
              if (inputRef.current) {
                setVisibleTimerSelection(false);

                inputRef.current.setSelectionRange(0, 2);
                setSelectedSection(TimeSection.HOURS);
              }
            }}
            onKeyDown={handleKeyDown}
          />

          <div
            className="absolute mr-2 cursor-pointer"
            onClick={() => {
              setVisibleTimerSelection(!visibleTimerSelection);
              setSelectedSection(null);
            }}
          >
            <Icon element={MdOutlineAvTimer} size={20} />
          </div>
        </div>
      </Tippy>
    </div>
  );
}
