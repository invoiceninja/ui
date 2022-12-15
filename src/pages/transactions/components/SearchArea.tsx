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
import { trans } from 'common/helpers';
import { ExpenseCategorySelector } from 'components/expense-categories/ExpenseCategorySelector';
import { VendorSelector } from 'components/vendors/VendorSelector';
import { Dispatch, SetStateAction, useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import { MdFilterAlt } from 'react-icons/md';
import { FilterModal } from './FilterModal';
import { SearchInput } from './ListBox';

interface Props {
  searchParams: SearchInput;
  setSearchParams: Dispatch<SetStateAction<SearchInput>>;
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  setIsFilterModalOpened: Dispatch<SetStateAction<boolean>>;
  isInvoicesDataKey: boolean;
  isFilterModalOpened: boolean;
  dataKey: string;
  isCreate: boolean;
}

export function SearchArea(props: Props) {
  const [
    isCreateExpenseCategoryModalOpen,
    setIsCreateExpenseCategoryModalOpen,
  ] = useState<boolean>(false);

  const [isCreateVendorModalOpen, setIsCreateVendorModalOpen] =
    useState<boolean>(false);

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
    <>
      <ExpenseCategorySelector
        initiallyVisible={isCreateExpenseCategoryModalOpen}
        setVisible={setIsCreateExpenseCategoryModalOpen}
        setSelectedIds={props.setSelectedIds}
        onChange={() => {}}
      />

      <VendorSelector
        initiallyVisible={isCreateVendorModalOpen}
        setVisible={setIsCreateVendorModalOpen}
        setSelectedIds={props.setSelectedIds}
        onChange={() => {}}
      />

      <div className="flex items-center">
        <InputField
          placeholder={trans(`search_${props.dataKey}`, {
            count: '',
          })}
          value={props.searchParams.searchTerm}
          onValueChange={(value) =>
            handleChangeSearchParams('searchTerm', value)
          }
        />

        {props.isInvoicesDataKey || !props.isCreate ? (
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
              props.dataKey === 'vendors'
                ? setIsCreateVendorModalOpen(true)
                : setIsCreateExpenseCategoryModalOpen(true)
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
    </>
  );
}
