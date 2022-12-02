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
import { BiPlusCircle } from 'react-icons/bi';
import { MdFilterAlt } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { FilterModal } from './FilterModal';
import { SearchInput } from './ListBox';

interface Props {
  searchParams: SearchInput;
  setSearchParams: Dispatch<SetStateAction<SearchInput>>;
  setIsFilterModalOpened: Dispatch<SetStateAction<boolean>>;
  isInvoicesDataKey: boolean;
  isFilterModalOpened: boolean;
  dataKey: string;
}

export function SearchArea(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const handleChangeSearchParams = (
    property: keyof SearchInput,
    value: SearchInput[keyof SearchInput]
  ) => {
    props.setSearchParams((prevState) => ({
      ...prevState,
      [property]: value,
    }));
  };

  return (
    <div className="flex items-center">
      <InputField
        className="bg-gray-200"
        placeholder={t(`search_${props.dataKey}`)}
        value={props.searchParams.searchTerm}
        onValueChange={(value) => handleChangeSearchParams('searchTerm', value)}
      />
      {props.isInvoicesDataKey ? (
        <MdFilterAlt
          className="ml-3 cursor-pointer"
          fontSize={28}
          onClick={() =>
            props.setIsFilterModalOpened((prevState) => !prevState)
          }
        />
      ) : (
        <BiPlusCircle
          className="ml-3 cursor-pointer"
          fontSize={28}
          onClick={() =>
            props.isInvoicesDataKey
              ? navigate('/vendors/create')
              : navigate('/settings/expense_categories/create')
          }
        />
      )}
      {props.isFilterModalOpened && (
        <FilterModal
          searchParams={props.searchParams}
          setSearchParams={props.setSearchParams}
        />
      )}
    </div>
  );
}
