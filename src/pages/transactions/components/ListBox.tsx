/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox, InputField } from '@invoiceninja/forms';
import { MdFilterAlt } from 'react-icons/md';
import invoiceStatus from 'common/constants/invoice-status';
import { StatusBadge } from 'components/StatusBadge';
import { TransactionDetails } from './TransactionMatchDetails';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';
import { useClientsQuery } from 'common/queries/clients';
import { Client } from 'common/interfaces/client';
import { Invoice } from 'common/interfaces/invoice';
import CommonProps from 'common/interfaces/common-props.interface';
import { BiPlusCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { useExpenseCategoriesQuery } from 'common/queries/expense-categories';
import { Vendor } from 'common/interfaces/vendor';
import { ExpenseCategory } from 'common/interfaces/expense-category';
import { useInvoicesQuery } from 'pages/invoices/common/queries';
import { useVendorsQuery } from 'common/queries/vendor';

interface SearchInput {
  searchTerm: string;
  minAmount: number;
  maxAmount: number;
  startDate: string;
  endDate: string;
}

interface Props extends CommonProps {
  transactionDetails: TransactionDetails;
  isCreditTransactionType: boolean;
  dataKey: 'invoices' | 'categories' | 'vendors';
  setSelectedIds: Dispatch<SetStateAction<string[] | undefined>>;
  selectedIds: string[] | undefined;
}

export default function ListBox(props: Props) {
  const [t] = useTranslation();

  const navigate = useNavigate();

  const company = useCurrentCompany();

  const formatMoney = useFormatMoney();

  const { data: clientsResponse } = useClientsQuery();

  const { data: vendorsResponse } = useVendorsQuery();

  const { data: invoicesResponse } = useInvoicesQuery();

  const { data: expenseCategoriesResponse } = useExpenseCategoriesQuery();

  const [isFilterModalOpened, setIsFilterModalOpened] = useState<boolean>();

  const [searchParams, setSearchParams] = useState<SearchInput>({
    searchTerm: '',
    minAmount: 0,
    maxAmount: 0,
    startDate: '',
    endDate: '',
  });

  const [vendors, setVendors] = useState<Vendor[]>();

  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>();

  const [invoices, setInvoices] = useState<Invoice[]>();

  const [expenseCategories, setExpenseCategories] =
    useState<ExpenseCategory[]>();

  const [filteredExpenseCategories, setFilteredExpenseCategories] =
    useState<ExpenseCategory[]>();

  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>();

  const [clients, setClients] = useState<Client[]>();

  const isItemChecked = (itemId: string) => {
    const filteredItemIds = props.selectedIds?.find((id) => id === itemId);
    return Boolean(filteredItemIds?.length);
  };

  const selectItem = (itemId: string) => {
    const filteredItemIdsList = props.selectedIds?.find((id) => itemId === id);

    let updatedItemIds;

    if (filteredItemIdsList?.length) {
      updatedItemIds = props.selectedIds?.filter((id) => id !== itemId);
      props.setSelectedIds(updatedItemIds);
    } else {
      updatedItemIds = [...(props.selectedIds || []), itemId];
      props.setSelectedIds(updatedItemIds);
    }

    if (props.dataKey === 'vendors') {
      const vendorIdsList = updatedItemIds?.join(',');

      const filteredVendorItems = vendors?.filter(({ id }) =>
        vendorIdsList ? vendorIdsList.includes(id) : true
      );

      setFilteredVendors(filteredVendorItems);
    }

    if (props.dataKey === 'categories') {
      const expenseCategoryIdsList = updatedItemIds?.join(',');

      const filteredExpenseCategoryItems = expenseCategories?.filter(({ id }) =>
        expenseCategoryIdsList ? expenseCategoryIdsList.includes(id) : true
      );

      setFilteredExpenseCategories(filteredExpenseCategoryItems);
    }
  };

  const getClientName = (clientId: string) => {
    return clients?.find(({ id }) => id === clientId)?.name;
  };

  const handleChangeSearchParams = (
    property: keyof SearchInput,
    value: SearchInput[keyof SearchInput]
  ) => {
    setSearchParams((prevState) => ({ ...prevState, [property]: value }));
  };

  const filterInvoicesBySearchParams = () => {
    const { searchTerm, minAmount, maxAmount, startDate, endDate } =
      searchParams;

    const updatedDataWithSearchTerm = invoices?.filter(
      ({ number, client_id }) =>
        searchTerm
          ? number.includes(searchTerm) ||
            getClientName(client_id)?.includes(searchTerm)
          : true
    );

    const updatedDataWithMinAmount = updatedDataWithSearchTerm?.filter(
      ({ amount }) => (minAmount ? amount >= minAmount : true)
    );

    const updatedDataWithMaxAmount = updatedDataWithMinAmount?.filter(
      ({ amount }) => (maxAmount ? amount <= maxAmount : true)
    );

    const updatedDataWithStartDate = updatedDataWithMaxAmount?.filter(
      ({ date }) => (startDate ? new Date(date) >= new Date(startDate) : true)
    );

    const updatedDataWithEndDate = updatedDataWithStartDate?.filter(
      ({ date }) => (endDate ? new Date(date) <= new Date(endDate) : true)
    );

    setFilteredInvoices(updatedDataWithEndDate);
  };

  const filterVendorsBySearchParams = () => {
    const { searchTerm } = searchParams;

    const updatedDataWithSearchTerm = vendors?.filter(({ number, name }) =>
      searchTerm
        ? number.includes(searchTerm) || name.includes(searchTerm)
        : true
    );

    setFilteredVendors(updatedDataWithSearchTerm);
  };

  const filterExpenseCategoriesBySearchParams = () => {
    const { searchTerm } = searchParams;

    const updatedDataWithSearchTerm = expenseCategories?.filter(({ name }) =>
      searchTerm ? name.includes(searchTerm) : true
    );

    setFilteredExpenseCategories(updatedDataWithSearchTerm);
  };

  useEffect(() => {
    if (props.isCreditTransactionType) {
      setClients(clientsResponse?.data.data);
      setInvoices(invoicesResponse);
      setFilteredInvoices(invoicesResponse);
    } else {
      setVendors(vendorsResponse);
      setFilteredVendors(vendorsResponse);
      setExpenseCategories(expenseCategoriesResponse);
      setFilteredExpenseCategories(expenseCategoriesResponse);
    }
  }, [
    invoicesResponse,
    clientsResponse,
    vendorsResponse,
    expenseCategoriesResponse,
  ]);

  useEffect(() => {
    if (props.dataKey === 'invoices') {
      filterInvoicesBySearchParams();
    } else if (props.dataKey === 'vendors') {
      filterVendorsBySearchParams();
    } else {
      filterExpenseCategoriesBySearchParams();
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col w-full">
      <div
        className={`flex justify-center items-start px-5 py-3 relative border-b border-t border-gray-400 ${props.className}`}
      >
        <form
          className="flex items-center"
          onSubmit={(event) => event.preventDefault()}
        >
          <InputField
            className="bg-gray-200"
            placeholder={t(`search_${props.dataKey}`)}
            value={searchParams.searchTerm}
            onValueChange={(value) =>
              handleChangeSearchParams('searchTerm', value)
            }
          />
          {props.isCreditTransactionType ? (
            <MdFilterAlt
              className="ml-3 cursor-pointer"
              fontSize={30}
              onClick={() => setIsFilterModalOpened((prevState) => !prevState)}
            />
          ) : (
            <BiPlusCircle
              className="ml-3 cursor-pointer"
              fontSize={28}
              onClick={() =>
                props.dataKey === 'vendors'
                  ? navigate('/vendors/create')
                  : navigate('/settings/expense_categories/create')
              }
            />
          )}
        </form>
        {isFilterModalOpened && props.isCreditTransactionType && (
          <form
            onSubmit={(event) => event.preventDefault()}
            className="absolute w-full top-full m-1 bg-gray-100 text-center pb-2 border-b border-gray-400 z-10"
          >
            <div className="w-3/5 p-3 inline-block">
              <div className="flex justify-center">
                <div className="flex flex-col items-start">
                  <p className="text-sm ml-2">{`${t('min')} ${t('amount')}`}</p>
                  <InputField
                    value={searchParams.minAmount}
                    onValueChange={(value) =>
                      handleChangeSearchParams(
                        'minAmount',
                        value ? Number(value) : 0
                      )
                    }
                  />
                </div>
                <div className="flex flex-col items-start pr-3">
                  <p className="text-sm ml-4">{`${t('max')} ${t('amount')}`}</p>
                  <InputField
                    value={searchParams.maxAmount}
                    onValueChange={(value) =>
                      handleChangeSearchParams(
                        'maxAmount',
                        value ? Number(value) : 0
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex justify-center mt-3 w-full">
                <div className="flex flex-col items-start w-1/2 pr-3">
                  <p className="text-sm ml-2">{`${t('start')} ${t('date')}`}</p>
                  <input
                    className="w-full border-none"
                    type="date"
                    value={searchParams.startDate}
                    onChange={(event) =>
                      handleChangeSearchParams(
                        'startDate',
                        event.target.value ? event.target.value : ''
                      )
                    }
                  />
                </div>
                <div className="flex flex-col items-start w-1/2">
                  <p className="text-sm ml-2">{`${t('end')} ${t('date')}`}</p>
                  <input
                    className="w-full border-none"
                    type="date"
                    value={searchParams.endDate}
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
          </form>
        )}
      </div>
      <div
        className="flex flex-col justify-start items-center overflow-y-auto border-b border-gray-400"
        style={{
          height: props.isCreditTransactionType ? 550 : 320,
          width: props.isCreditTransactionType ? 600 : 'auto',
        }}
      >
        {props.isCreditTransactionType &&
          filteredInvoices?.map((invoice) => (
            <div
              key={invoice.id}
              className="flex justify-between hover:bg-gray-100 w-full cursor-pointer p-4 border-b border-gray-400"
              onClick={() => selectItem(invoice.id)}
            >
              <div className="flex items-center">
                <Checkbox
                  checked={isItemChecked(invoice.id)}
                  onClick={() => selectItem(invoice.id)}
                />
                <span className="text-sm">{invoice.number}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm">
                  {getClientName(invoice.client_id)}
                </span>
                <span className="text-sm text-gray-600">{invoice.date}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-6 text-sm">
                  {formatMoney(
                    invoice.amount,
                    company.settings.country_id,
                    company.settings.currency_id
                  )}
                </span>
                <StatusBadge for={invoiceStatus} code={invoice.status_id} />
              </div>
            </div>
          ))}

        {props.dataKey === 'vendors' &&
          filteredVendors?.map(({ id, name, number }) => (
            <div
              key={id}
              className="flex justify-between relative hover:bg-gray-100 w-full cursor-pointer p-4 border-b border-gray-400"
              onClick={() => selectItem(id)}
            >
              <div className="flex items-center">
                <Checkbox
                  checked={isItemChecked(id)}
                  onClick={() => selectItem(id)}
                />
                <div className="flex flex-col items-center ml-2">
                  <span className="text-md">{name}</span>
                  <span className="text-sm text-gray-500">{number}</span>
                </div>
              </div>
            </div>
          ))}

        {props.dataKey === 'categories' &&
          filteredExpenseCategories?.map(({ id, name }) => (
            <div
              key={id}
              className="flex justify-between hover:bg-gray-100 w-full cursor-pointer p-4 border-b border-gray-400"
              onClick={() => selectItem(id)}
            >
              <div className="flex items-center">
                <Checkbox
                  checked={isItemChecked(id)}
                  onClick={() => selectItem(id)}
                />
                <span className="text-md">{name}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
