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
import { date, endpoint, trans } from "common/helpers";
import { useFormatMoney } from "common/hooks/money/useFormatMoney";
import { useCurrentCompanyDateFormats } from "common/hooks/useCurrentCompanyDateFormats";
import { DataTableColumns } from "components/DataTable";
import { Spinner } from "components/Spinner";
import { request } from 'common/helpers/request';
import { t } from "i18next";
import { isError } from "lodash";
import { useQuery } from "react-query";
import { Link, generatePath } from "react-router-dom";

export function Activity() {
    
    const { dateFormat } = useCurrentCompanyDateFormats();
    const formatMoney = useFormatMoney();

    const { data, isLoading, isError } = useQuery('/api/v1/activities', () =>
        request('GET', endpoint('/api/v1/activities'))
    );

    const columns: DataTableColumns = [

        {
            id: 'created_at',
            label: t('activity'),
            format: (value) => date(value, dateFormat),
        }
    ];
    
    return (
        <div className="bg-white shadow sm:rounded-lg sm:overflow-hidden">
            <div className="divide-y divide-gray-200">
                <div className="px-2 py-2 sm:px-6">
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

                                            
                                            <td className='px-2 lg:px-2.5 xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900'>
                                                {date(resource.created_at, dateFormat)}  {trans(`activity_${resource.activity_type_id}`,
                                                    {
                                                    'client':resource.client_id, 
                                                    'contact':resource.client_contact_id, 
                                                    'quote':resource.quote_id,
                                                    'user':resource.user_id,
                                                    'expense':resource.expense_id,
                                                    'invoice':resource.invoice_id,
                                                    'recurring_invoice':resource.recurring_invoice_id,
                                                    }
                                                )}
                                            </td>
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