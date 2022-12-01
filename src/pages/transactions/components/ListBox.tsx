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
import { useResourceDataQuery } from '../common/queries';
import { ListBoxItem } from './ListBoxItem';

export interface ResourceItem {
  id: string;
  name?: string;
  number?: number;
  clientName?: string;
  status_id?: string;
  amount?: number;
  date?: string;
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
  setSelectedIds: Dispatch<SetStateAction<string[] | undefined>>;
  selectedIds: string[] | undefined;
}

export function ListBox(props: Props) {
  const { data: clientsResponse } = useClientsQuery();

  const { data: resourceResponse } = useResourceDataQuery({
    dataKey: props.dataKey,
  });

  const [searchParams, setSearchParams] = useState<SearchInput>({
    searchTerm: '',
    minAmount: 0,
    maxAmount: 0,
    startDate: '',
    endDate: '',
  });

  const [resourceItems, setResourceItems] = useState<ResourceItem[]>();

  const [clients, setClients] = useState<Client[]>();

  const [isFilterModalOpened, setIsFilterModalOpened] =
    useState<boolean>(false);

  const [isInvoicesDataKey, setIsInvoicesDataKey] = useState<boolean>(false);

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
  };

  const getClientName = (clientId: string) => {
    return clients?.find(({ id }) => id === clientId)?.name;
  };

  const getResourceObject = (resourceList: any) => {
    return resourceList?.map((resourceItem: any) => ({
      id: resourceItem.id,
      number: resourceItem?.number,
      name: resourceItem?.name,
      clientName: getClientName(resourceItem?.client_id),
      status_id: resourceItem?.status_id,
      amount: resourceItem?.amount,
      date: resourceItem?.date,
    }));
  };

  useEffect(() => {
    setClients(clientsResponse?.data.data);
    setResourceItems(getResourceObject(resourceResponse));
    if (props.dataKey === 'invoices') {
      setIsInvoicesDataKey(true);
    }
  }, [props.dataKey, resourceResponse, clientsResponse]);

  useEffect(() => {
    console.log('ok');
  }, [searchParams]);

  return (
    <div className="flex flex-col w-full">
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
        />
      </div>
      <ul
        className="flex flex-col justify-start overflow-y-auto"
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
