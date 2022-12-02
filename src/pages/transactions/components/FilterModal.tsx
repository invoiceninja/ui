/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField } from '@invoiceninja/forms';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from './ListBox';

interface Props {
  searchParams: SearchInput;
  setSearchParams: Dispatch<SetStateAction<SearchInput>>;
}

export function FilterModal(props: Props) {
  const [t] = useTranslation();

  const handleChangeSearchParams = (
    property: keyof SearchInput,
    value: SearchInput[keyof SearchInput]
  ) => {
    props.setSearchParams((prevState) => ({ ...prevState, [property]: value }));
  };

  return (
    <div className="absolute w-full top-full left-0 mt-1 bg-gray-100 text-center pb-2 border-b border-gray-200 z-10">
      <div className="flex flex-col items-center p-3">
        <div className="flex justify-evenly w-full">
          <div className="flex flex-col items-start w-2/5">
            <p className="text-sm ml-2">{`${t('min')} ${t('amount')}`}</p>
            <InputField
              className="w-full"
              value={props.searchParams.minAmount}
              onValueChange={(value) =>
                handleChangeSearchParams('minAmount', value ? Number(value) : 0)
              }
            />
          </div>
          <div className="flex flex-col items-start w-2/5">
            <p className="text-sm ml-2">{`${t('max')} ${t('amount')}`}</p>
            <InputField
              value={props.searchParams.maxAmount}
              onValueChange={(value) =>
                handleChangeSearchParams('maxAmount', value ? Number(value) : 0)
              }
            />
          </div>
        </div>
        <div className="flex justify-evenly mt-3 w-full">
          <div className="flex flex-col items-start w-2/5">
            <p className="text-sm ml-2">{`${t('start')} ${t('date')}`}</p>
            <input
              className="w-full border-gray-300"
              type="date"
              value={props.searchParams.startDate}
              onChange={(event) =>
                handleChangeSearchParams(
                  'startDate',
                  event.target.value ? event.target.value : ''
                )
              }
            />
          </div>
          <div className="flex flex-col items-start w-2/5">
            <p className="text-sm ml-2">{`${t('end')} ${t('date')}`}</p>
            <input
              className="w-full border-gray-300"
              type="date"
              value={props.searchParams.endDate}
              onChange={(event) =>
                handleChangeSearchParams(
                  'endDate',
                  event.target.value ? event.target.value : ''
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
