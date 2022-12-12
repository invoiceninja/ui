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
import { useClientsQuery } from 'common/queries/clients';
import { Client } from 'common/interfaces/client';
import CommonProps from 'common/interfaces/common-props.interface';
import { SearchArea } from './SearchArea';
import { ListBoxItem } from './ListBoxItem';
import { useInvoicesQuery } from 'pages/invoices/common/queries';
import { useVendorsQuery } from 'common/queries/vendor';
import { useExpenseCategoriesQuery } from 'common/queries/expense-categories';

export interface ResourceItem {
  id: string;
  name: string;
  number: number;
  clientName: string;
  clientId: string;
  statusId: string;
  amount: number;
  date: string;
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
  dataKey: 'invoices' | 'categories' | 'vendors';
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

  const [clientId, setClientId] = useState<string>();

  const { data: clientsResponse } = useClientsQuery({
    enabled: isInvoicesDataKey,
  });

  const { data: invoicesResponse } = useInvoicesQuery({
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
    return clients?.find(({ id }) => id === clientId)?.name;
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
    }));
  };

  useEffect(() => {
    setClients(clientsResponse);

    if (isInvoicesDataKey) {
      setResourceItems(getFormattedResourceList(invoicesResponse));
    } else if (isVendorsDataKey) {
      setResourceItems(getFormattedResourceList(vendorsResponse));
    } else {
      setResourceItems(getFormattedResourceList(expenseCategoriesResponse));
    }
  }, [
    props.dataKey,
    invoicesResponse,
    vendorsResponse,
    expenseCategoriesResponse,
    clientsResponse,
  ]);

  useEffect(() => {
    if (isInvoicesDataKey && !props.selectedIds?.length) {
      setClientId('');
    }
  }, [props.selectedIds]);

  return (
    <div className="flex flex-col flex-1 w-full">
      <div
        className={`flex justify-center px-5 py-3 relative border-b border-t border-gray-200 ${props.className}`}
      >
        <SearchArea
          dataKey={props.dataKey}
          isInvoicesDataKey={isInvoicesDataKey}
          searchParams={searchParams}
          setIsFilterModalOpened={setIsFilterModalOpened}
          isFilterModalOpened={isFilterModalOpened}
          setSearchParams={setSearchParams}
          setSelectedIds={props.setSelectedIds}
        />
      </div>
      <ul
        className="flex flex-col grow justify-start overflow-y-auto"
        style={{
          height: isInvoicesDataKey ? 400 : 200,
        }}
      >
        {resourceItems?.map(
          (resourceItem: ResourceItem) =>
            (isItemChecked(resourceItem.id) ||
              !props.selectedIds?.length ||
              isInvoicesDataKey) && (
              <ListBoxItem
                key={resourceItem.id}
                isItemChecked={isItemChecked(resourceItem.id)}
                resourceItem={resourceItem}
                selectItem={selectItem}
              />
            )
        )}
      </ul>
    </div>
  );
}
