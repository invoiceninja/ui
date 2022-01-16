/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Checkbox } from './forms';
import { Spinner } from './Spinner';
import { Pagination, Table, Tbody, Td, Th, Thead, Tr } from './tables';

export type DataTableColumns = {
  id: string;
  label: string;
  format?: (field: string | number, resource?: any) => any;
}[];

interface Props {
  columns: DataTableColumns;
  endpoint: string;
}

export function DataTable(props: Props) {
  const [t] = useTranslation();

  const [apiEndpoint, setApiEndpoint] = useState(props.endpoint);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [sort, setSort] = useState<string>('id|asc');

  useEffect(() => {
    setApiEndpoint(
      endpoint(
        `${props.endpoint}?per_page=:perPage&page=:currentPage&filter=:filter&sort=:sort`,
        { perPage, currentPage, filter, sort }
      )
    );
  }, [perPage, currentPage, filter, sort]);

  const { data, isLoading, isError } = useQuery(apiEndpoint, () =>
    axios.get(apiEndpoint, { headers: defaultHeaders })
  );

  console.log(data);

  return (
    <>
      <Table>
        <Thead>
          <Th>
            <Checkbox />
          </Th>
          {props.columns.map((column, index) => (
            <Th key={index}>{column.label}</Th>
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

          {data &&
            data?.data?.data?.map((resource: any, index: number) => (
              <Tr key={index}>
                <Td>
                  <Checkbox />
                </Td>

                {props.columns.map((column, index) => (
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

      {data && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
        />
      )}
    </>
  );
}
