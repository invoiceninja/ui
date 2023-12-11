/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { TransactionDetails } from './TransactionMatchDetails';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useClientsQuery } from '$app/common/queries/clients';
import { Client } from '$app/common/interfaces/client';
import CommonProps from '$app/common/interfaces/common-props.interface';
import { SearchArea } from './SearchArea';
import { ListBoxItem } from './ListBoxItem';
import { useInvoicesQuery } from '$app/pages/invoices/common/queries';
import { useVendorsQuery } from '$app/common/queries/vendor';
import { useExpenseCategoriesQuery } from '$app/common/queries/expense-categories';
import { usePaymentsQuery } from '$app/common/queries/payments';
import { useExpensesQuery } from '$app/common/queries/expenses';
import { useColorScheme } from '$app/common/colors';

export interface ResourceItem {
  id: string;
  name: string;
  number: number;
  clientName: string;
  clientId: string;
  statusId: string;
  amount: number;
  date: string;
  should_be_invoiced: boolean;
  invoice_id: string;
  payment_date: string;
  transaction_reference: string;
  payment_type_id: string;
  archived_at: number;
  is_deleted: boolean;
  country_id: string;
  currency_id: string;
}

export interface SearchInput {
  searchTerm: string;
  minAmount: number;
  maxAmount: number;
  startDate: string;
  endDate: string;
}

interface Props extends CommonProps {
  transactionDetails: TransactionDetails;
  dataKey: 'invoices' | 'categories' | 'vendors' | 'payments' | 'expenses';
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  selectedIds: string[];
}

export function ListBox(props: Props) {
  const [searchParams, setSearchParams] = useState<SearchInput>({
    searchTerm: '',
    minAmount: 0,
    maxAmount: 0,
    startDate: '',
    endDate: '',
  });

  const isInvoicesDataKey = props.dataKey === 'invoices';

  const isVendorsDataKey = props.dataKey === 'vendors';

  const isExpenseCategoriesDataKey = props.dataKey === 'categories';

  const isPaymentsDataKey = props.dataKey === 'payments';

  const isExpensesDataKey = props.dataKey === 'expenses';

  const [clientId, setClientId] = useState<string>();

  const { data: clientsResponse } = useClientsQuery({
    enabled: isInvoicesDataKey,
  });

  const { data: invoicesResponse } = useInvoicesQuery({
    include: 'client',
    clientStatus: 'unpaid',
    filter: searchParams.searchTerm,
    clientId,
    enabled: isInvoicesDataKey,
  });

  const { data: vendorsResponse } = useVendorsQuery({
    filter: searchParams.searchTerm,
    enabled: isVendorsDataKey,
  });

  const { data: expenseCategoriesResponse } = useExpenseCategoriesQuery({
    filter: searchParams.searchTerm,
    enabled: isExpenseCategoriesDataKey,
  });

  const { data: paymentsResponse } = usePaymentsQuery({
    include: 'client',
    filter: searchParams.searchTerm,
    enabled: isPaymentsDataKey,
    matchTransactions: true,
  });

  const { data: expensesResponse } = useExpensesQuery({
    include: 'client',
    filter: searchParams.searchTerm,
    enabled: isExpensesDataKey,
    matchTransactions: true,
  });

  const [resourceItems, setResourceItems] = useState<ResourceItem[]>();

  const [clients, setClients] = useState<Client[]>();

  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);

  const isItemChecked = (itemId: string) => {
    return Boolean(props.selectedIds?.find((id) => id === itemId)?.length);
  };

  const selectItem = (itemId: string, clientId?: string) => {
    setClientId(clientId);

    const filteredItemIdsList = props.selectedIds?.find((id) => itemId === id);

    let updatedItemIds;

    if (filteredItemIdsList?.length) {
      updatedItemIds = props.selectedIds?.filter((id) => id !== itemId);
      props.setSelectedIds(updatedItemIds);
    } else {
      updatedItemIds = [...(props.selectedIds || []), itemId];
      props.setSelectedIds(updatedItemIds);
    }
  };

  const getClientName = (clientId: string) => {
    return clients?.find(({ id }) => id === clientId)?.display_name;
  };

  const getFormattedResourceList = (resourceList: any) => {
    return resourceList?.map((resourceItem: any) => ({
      id: resourceItem.id,
      number: resourceItem.number,
      name: resourceItem.name,
      clientName: getClientName(resourceItem.client_id),
      statusId: resourceItem.status_id,
      amount: resourceItem.amount,
      date: resourceItem.date,
      clientId: resourceItem.client_id,
      should_be_invoiced: resourceItem.should_be_invoiced,
      invoice_id: resourceItem.invoice_id,
      payment_date: resourceItem.payment_date,
      transaction_reference: resourceItem.transaction_reference,
      payment_type_id: resourceItem.payment_type_id,
      country_id: resourceItem.country_id || resourceItem.client?.country_id,
      currency_id:
        resourceItem.currency_id || resourceItem.client?.settings.currency_id,
    }));
  };

  useEffect(() => {
    setClients(clientsResponse);

    if (isInvoicesDataKey) {
      setResourceItems(getFormattedResourceList(invoicesResponse));
    } else if (isVendorsDataKey) {
      setResourceItems(getFormattedResourceList(vendorsResponse));
    } else if (isExpenseCategoriesDataKey) {
      setResourceItems(getFormattedResourceList(expenseCategoriesResponse));
    } else if (isPaymentsDataKey) {
      setResourceItems(getFormattedResourceList(paymentsResponse));
    } else {
      setResourceItems(getFormattedResourceList(expensesResponse));
    }
  }, [
    props.dataKey,
    invoicesResponse,
    vendorsResponse,
    expenseCategoriesResponse,
    clientsResponse,
    paymentsResponse,
    expensesResponse,
  ]);

  useEffect(() => {
    if (isInvoicesDataKey && !props.selectedIds?.length) {
      setClientId('');
    }
  }, [props.selectedIds]);
  
  const colors = useColorScheme();

  return (
    <div className="flex flex-col flex-1 w-full" style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}>
      <div
        style={{ color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
        className={`flex justify-center px-5 py-3 relative border-b border-t ${props.className}`}
      >
        <SearchArea
          dataKey={props.dataKey}
          searchParams={searchParams}
          setIsFilterModalOpened={setIsFilterModalOpened}
          isFilterModalOpened={isFilterModalOpened}
          setSearchParams={setSearchParams}
          setSelectedIds={props.setSelectedIds}
        />
      </div>
      <ul
        style={{ height: isInvoicesDataKey ? 400 : 200, color: colors.$3, colorScheme: colors.$0, backgroundColor: colors.$1, borderColor: colors.$4 }}
        className="flex flex-col grow justify-start overflow-y-auto"
      >
        {resourceItems?.map(
          (resourceItem: ResourceItem) =>
            (isItemChecked(resourceItem.id) ||
              !props.selectedIds?.length ||
              isInvoicesDataKey ||
              isExpensesDataKey) && (
              <ListBoxItem
                key={resourceItem.id}
                isItemChecked={isItemChecked(resourceItem.id)}
                resourceItem={resourceItem}
                selectItem={selectItem}
                dataKey={props.dataKey}
              />
            )
        )}
      </ul>
    </div>
  );
}
