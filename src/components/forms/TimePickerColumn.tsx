/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyTimeFormat } from '$app/common/hooks/useCompanyTimeFormat';
import classNames from 'classnames';
import { TimeSection } from './TimePicker';

interface Props {
  section: TimeSection;
  isSelected: (section: TimeSection, value: string) => boolean;
  handleChange: (
    value: string,
    section?: number,
    popperChange?: boolean
  ) => string | undefined;
}

export function TimePickerColumn(props: Props) {
  const { section, isSelected, handleChange } = props;

  const { timeFormatId } = useCompanyTimeFormat();

  const arrayNumbers = TimeSection.HOURS === section ? timeFormatId : 60;

  const getFormattedNumber = (value: number) => {
    if (value < 10) {
      return '0' + value.toString();
    }

    return value.toString();
  };

  return (
    <div className="overflow-scroll scrollbar-none">
      {[...Array(arrayNumbers).keys()].map((number, index) => (
        <div
          key={index.toString() + section}
          className={classNames(
            'flex items-center justify-center px-4 py-2 cursor-pointer',
            {
              'bg-gray-500 text-white': isSelected(
                section,
                getFormattedNumber(number)
              ),
              'hover:bg-gray-200': !isSelected(
                section,
                getFormattedNumber(number)
              ),
            }
          )}
          onClick={() =>
            handleChange(getFormattedNumber(number), section, true)
          }
        >
          {getFormattedNumber(number)}
        </div>
      ))}
    </div>
  );
}
