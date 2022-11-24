/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Button, Checkbox, InputField } from '@invoiceninja/forms';
import { ApiTransactionType } from 'common/enums/transactions';
import { Client } from 'common/interfaces/client';
import { Invoice } from 'common/interfaces/invoice';
import { useClientsQuery } from 'common/queries/clients';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdContentCopy, MdFilterAlt } from 'react-icons/md';
import { useInvoicesQuery } from '../common/queries';
import invoiceStatus from 'common/constants/invoice-status';
import { StatusBadge } from 'components/StatusBadge';
import { useFormatMoney } from 'common/hooks/money/useFormatMoney';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';

interface Props {
  base_type: string;
}

export default function TransactionMatchDetails(props: Props) {
  const [t] = useTranslation();

  const { data } = useInvoicesQuery();

  const formatMoney = useFormatMoney();

  const company = useCurrentCompany();

  const { data: clientsResponse } = useClientsQuery();

  const [isFilterModalOpened, setIsFilterModalOpened] = useState<boolean>();

  const [invoices, setInvoices] = useState<Invoice[]>();

  const [clients, setClients] = useState<Client[]>();

  const getClientName = (clientId: string) => {
    return clients?.find(({ id }) => id === clientId)?.name;
  };

  const getClientCountryId = (clientId: string) => {
    return clients?.find(({ id }) => id === clientId)?.country_id;
  };

  useEffect(() => {
    setClients(clientsResponse?.data?.data);
    setInvoices(data);
  }, [data, clientsResponse]);

  return (
    <div className="flex flex-col items-center justify-center mt-10 px-7 border-gray-400">
      <div className="flex justify-center px-5 py-3 w-full relative border-b border-t border-gray-400">
        <div className="flex items-center">
          <InputField
            placeholder={`Search ${
              props.base_type === ApiTransactionType.Credit
                ? 'Invoices'
                : 'Expenses'
            }`}
          />
          <MdFilterAlt
            className="ml-3 cursor-pointer"
            style={{ fontSize: 30 }}
            onClick={() => setIsFilterModalOpened((prevState) => !prevState)}
          />
        </div>
        {isFilterModalOpened && (
          <div className="absolute w-full top-full m-1 bg-gray-400 text-center pb-2 border-b border-gray-400 z-10">
            <div className="w-3/5 p-3 inline-block">
              <div className="flex justify-center">
                <div className="flex flex-col items-start">
                  <p className="text-sm ml-2">{`${t('min')} ${t('amount')}`}</p>
                  <InputField />
                </div>
                <div className="flex flex-col items-start pr-3">
                  <p className="text-sm ml-4">{`${t('max')} ${t('amount')}`}</p>
                  <InputField className="ml-3" />
                </div>
              </div>
              <div className="flex justify-center mt-3 w-full">
                <div className="flex flex-col items-start w-1/2 pr-3">
                  <p className="text-sm ml-2">{`${t('start')} ${t('date')}`}</p>
                  <input className="w-full border-none" type="date"></input>
                </div>
                <div className="flex flex-col items-start w-1/2">
                  <p className="text-sm ml-2">{`${t('end')} ${t('date')}`}</p>
                  <input className="w-full border-none" type="date"></input>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div
        className="flex flex-col justify-start items-center overflow-y-auto w-full border-b border-gray-400"
        style={{
          height: 350,
        }}
      >
        {invoices?.map((invoice) => (
          <div
            key={invoice?.id}
            className="flex justify-between hover:bg-gray-100 w-full cursor-pointer p-3 border-b border-t border-gray-400"
          >
            <div className="flex items-center">
              <Checkbox />
              <span className="text-md">{invoice.number}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-md">
                {getClientName(invoice.client_id)}
              </span>
              <span className="text-sm text-gray-600">{invoice.date}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-6">
                {formatMoney(
                  invoice.amount,
                  getClientCountryId(invoice.client_id) || '1',
                  company.settings.currency_id
                )}
              </span>
              <StatusBadge for={invoiceStatus} code={invoice.status_id} />
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-4 w-full">
        {<MdContentCopy style={{ fontSize: 22 }} />}
        <span>
          {props.base_type === ApiTransactionType.Credit
            ? 'Convert to Payment'
            : 'Expenses'}
        </span>
      </Button>
    </div>
  );
}
