/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const DAYS = Array.from({ length: 30 }, (_, index) => String(index + 1));

const DayCell = styled.div`
  transition: border-color 150ms ease, background-color 150ms ease;

  &:hover {
    background-color: ${(props) => props.theme.hover};
  }
`;

interface Props {
  value: string;
  label: string;
  onChange: (day: string) => void;
}

export function DueDayPicker({ value, label, onChange }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const days = [
    ...DAYS.map((day) => ({
      value: day,
      label: day,
      name: `${t('day')} ${day}`,
    })),
    {
      value: '31',
      label: t('last_day_of_month'),
      name: t('last_day_of_month'),
    },
  ];

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      aria-label={label}
      className="grid grid-cols-6 gap-1.5 max-w-sm"
    >
      {days.map((day) => (
        <RadioGroup.Option
          key={day.value}
          value={day.value}
          aria-label={day.name}
          className={classNames('focus:outline-none', {
            'col-span-6': day.value === '31',
          })}
        >
          {({ checked, active }) => (
            <DayCell
              theme={{ hover: colors.$25 }}
              className="h-9 px-1 text-sm border grid place-items-center cursor-pointer truncate"
              style={{
                borderRadius: '0.375rem',
                borderColor: checked ? colors.$3 : colors.$24,
                backgroundColor: checked ? colors.$25 : colors.$1,
                color: colors.$3,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                boxShadow: checked ? `inset 0 0 0 1px ${colors.$3}` : 'none',
                outline: active ? `2px solid ${accentColor}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {day.label}
            </DayCell>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
}
