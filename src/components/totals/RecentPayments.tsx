/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Table, Thead, Th, Tbody, Tr, Td } from "@invoiceninja/tables";
import { date, endpoint } from "common/helpers";
import { useFormatMoney } from "common/hooks/money/useFormatMoney";
import { useCurrentCompanyDateFormats } from "common/hooks/useCurrentCompanyDateFormats";
import { DataTableColumns } from "components/DataTable";
import { Spinner } from "components/Spinner";
import { t } from "i18next";
import { useQuery } from "react-query";
import { Link, generatePath } from "react-router-dom";
import { request } from 'common/helpers/request';


export function RecentPayments() {

    const { dateFormat } = useCurrentCompanyDateFormats();
    const formatMoney = useFormatMoney();

    const { data, isLoading, isError } = useQuery('/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&page=1', () =>
        request('GET', endpoint('/api/v1/payments?include=client,invoices&sort=date|desc&per_page=50&page=1'))
    );

    const columns: DataTableColumns = [
        {
            id: 'number',
            label: t('number'),
            format: (value, resource) => {
                return (
                    <Link to={generatePath('/payments/:id/edit', { id: resource.id })}>
                        {resource.number}
                    </Link>
                );
            },
        },
        {
            id: 'client_id',
            label: t('client'),
            format: (value, resource) => (
                <Link to={generatePath('/clients/:id', { id: resource.client.id })}>
                    {resource.client.display_name}
                </Link>
            ),
        },
        {
            id: 'amount',
            label: t('amount'),
            format: (value, resource) =>
                formatMoney(
                    value,
                    resource?.client.country_id,
                    resource?.client.settings.currency_id
                ),
        },
        {
            id: 'invoice_number',
            label: t('invoice_number'),
            format: (value, resource) => resource.invoices[0]?.number,
        },
        {
            id: 'date',
            label: t('date'),
            format: (value) => date(value, dateFormat),
        }
    ];

    return (
            
            <div className="bg-white shadow sm:rounded-lg sm:overflow-hidden">
                <div className="divide-y divide-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                        <h2 id="notes-title" className="text-lg font-medium text-gray-900">{t('recent_payments')}</h2>
                    </div>
                    <div className="">

                    <Table>
                        <Thead>
                            {columns.map((column, index) => (
                                <Th
                                    id={column.id}
                                    key={index}
                                >
                                    {column.label}
                                </Th>
                            ))}
                        </Thead>

                        <Tbody>
                            {isLoading && (
                                <Tr>
                                    <Td colSpan={100}>
                                        <Spinner />
                                    </Td>
                                </Tr>
                            )}

                            {isError && (
                                <Tr>
                                    <Td className="text-center" colSpan={100}>
                                        {t('error_refresh_page')}
                                    </Td>
                                </Tr>
                            )}

                            {data && data.data.data.length === 0 && (
                                <Tr>
                                    <Td colSpan={100}>{t('no_records_found')}</Td>
                                </Tr>
                            )}

                            {data &&
                                data?.data?.data?.map((resource: any, index: number) => (
                                    <Tr
                                        key={index}
                                        onClick={() => document.getElementById(resource.id)?.click()}
                                    >
                                        {columns.map((column, index) => (
                                            <Td key={index}>
                                                {column.format
                                                    ? column.format(resource[column.id], resource)
                                                    : resource[column.id]}
                                            </Td>
                                        ))}

                                    </Tr>
                                ))}
                        </Tbody>
                    </Table>

                
                        
                    </div>
                </div>

            </div>

    );
}