/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputField } from '$app/components/forms';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from './ListBox';
import { useColorScheme } from '$app/common/colors';

interface Props {
  searchParams: SearchInput;
  setSearchParams: Dispatch<SetStateAction<SearchInput>>;
}

export function FilterModal(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const handleChangeSearchParams = (
    property: keyof SearchInput,
    value: SearchInput[keyof SearchInput]
  ) => {
    props.setSearchParams((prevState) => ({ ...prevState, [property]: value }));
  };

  return (
    <div
      className="absolute w-full top-full left-0 mt-1 text-center z-10"
      style={{
        color: colors.$3,
        colorScheme: colors.$0,
        backgroundColor: colors.$1,
        borderColor: colors.$4,
      }}
    >
      <div
        className="flex flex-col items-center pt-3 pb-6 space-y-3"
        style={{
          color: colors.$3,
          colorScheme: colors.$0,
          backgroundColor: colors.$1,
          borderBottom: `1px solid ${colors.$5}`,
        }}
      >
        <div
          className="flex justify-evenly w-full"
          style={{
            color: colors.$3,
            colorScheme: colors.$0,
            backgroundColor: colors.$1,
            borderColor: colors.$4,
          }}
        >
          <InputField
            changeOverride={true}
            style={{
              color: colors.$3,
              colorScheme: colors.$0,
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
            width="12rem"
            label={`${t('min')} ${t('amount')}`}
            value={props.searchParams.minAmount}
            onValueChange={(value) =>
              handleChangeSearchParams(
                'minAmount',
                !isNaN(Number(value)) ? Number(value) : 0
              )
            }
          />
          <InputField
            changeOverride={true}
            style={{
              color: colors.$3,
              colorScheme: colors.$0,
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
            width="12rem"
            label={`${t('max')} ${t('amount')}`}
            value={props.searchParams.maxAmount}
            onValueChange={(value) =>
              handleChangeSearchParams(
                'maxAmount',
                !isNaN(Number(value)) ? Number(value) : 0
              )
            }
          />
        </div>
        <div className="flex justify-evenly w-full">
          <InputField
            style={{
              color: colors.$3,
              colorScheme: colors.$0,
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
            className="w-full"
            width="12rem"
            label={t('start')}
            type="date"
            value={props.searchParams.startDate}
            onValueChange={(value: string) =>
              handleChangeSearchParams('startDate', value ? value : '')
            }
          />
          <InputField
            changeOverride={true}
            style={{
              color: colors.$3,
              colorScheme: colors.$0,
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
            className="w-full"
            width="12rem"
            label={t('end')}
            type="date"
            value={props.searchParams.endDate}
            onValueChange={(value: string) =>
              handleChangeSearchParams('endDate', value ? value : '')
            }
          />
        </div>
      </div>
    </div>
  );
}
