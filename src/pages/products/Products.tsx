/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { bulk, useProductsQuery } from '../../common/queries/products';
import { Default } from '../../components/layouts/Default';
import { generatePath } from 'react-router';
import { Actions } from '../../components/datatables/Actions';
import {Link, Checkbox, Button} from '@invoiceninja/forms'
import { CheckSquare, PlusCircle } from 'react-feather';
import { handleCheckboxChange } from '../../common/helpers';
import { Spinner } from '../../components/Spinner';
import { AxiosError, AxiosResponse } from 'axios';
import { Dropdown } from '../../components/dropdown/Dropdown';
import { DropdownElement } from '../../components/dropdown/DropdownElement';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import {
  Table,
  Thead,
  Th,
  ColumnSortPayload,
  Tbody,
  Tr,
  Td,
  Pagination,
} from '@invoiceninja/tables';
import { Breadcrumbs } from 'components/Breadcrumbs';

export function Products() {
  const [t] = useTranslation();

  const pages = [
    { name: t('products'), href: '/products' }
  ];

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('products')}`;
  });

  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState('10');
  const [status, setStatus] = useState(['active']);
  const [selected, setSelected] = useState(new Set<string>());
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [sortedBy, setSortedBy] = useState<string | undefined>(undefined);
  const mainCheckbox = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const options = [
    { value: 'active', label: t('active') },
    { value: 'archived', label: t('archived') },
    { value: 'deleted', label: t('deleted') },
  ];

  const { data } = useProductsQuery({
    perPage,
    currentPage,
    filter,
    status,
    sort,
  });

  const archive = () => {
    bulk(Array.from(selected), 'archive')
      .then((response: AxiosResponse) => {
        toast.success(
          generatePath(t('archived_products'), {
            count: response.data.data.length.toString(),
          })
        );

        selected.clear();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /** @ts-ignore: Unreachable, if element is null/undefined. */
        mainCheckbox.current.checked = false;
      })
      .catch((error: AxiosError) => console.error(error.response?.data))
      .finally(() => queryClient.invalidateQueries('/api/v1/products'));
  };

  const restore = () => {
    bulk(Array.from(selected), 'restore')
      .then((response: AxiosResponse) => {
        toast.success(
          generatePath(t('restored_products'), {
            value: response.data.data.length.toString(),
          })
        );

        selected.clear();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable when element is undefined.
        mainCheckbox.current.checked = false;
      })
      .catch((error: AxiosError) => console.error(error.response?.data))
      .finally(() => queryClient.invalidateQueries('/api/v1/products'));
  };

  const destroy = () => {
    if (!confirm(t('are_you_sure'))) {
      return;
    }

    bulk(Array.from(selected), 'delete')
      .then(() => {
        toast.success(t('deleted_product'));

        selected.clear();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: Unreachable when element is undefined.
        mainCheckbox.current.checked = false;
      })
      .catch((error: AxiosError) => console.error(error.response?.data))
      .finally(() => queryClient.invalidateQueries('/api/v1/products'));
  };

  return (
    <Default title={t('products')}>
      <Breadcrumbs pages={pages} />

      <Actions
        onStatusChange={setStatus}
        onFilterChange={setFilter}
        optionsMultiSelect={true}
        options={options}
        defaultOption={options[0]}
        rightSide={
          <Button to="/products/create">
            <span>{t('new_product')}</span>
            <PlusCircle size="20" />
          </Button>
        }
      >
        <Button>
          <span>{t('invoice')}</span>
          <CheckSquare size="20" />
        </Button>

        <Dropdown label={t('actions')}>
          <DropdownElement onClick={archive}>
            {t('archive_product')}
          </DropdownElement>

          <DropdownElement onClick={restore}>
            {t('restore_product')}
          </DropdownElement>

          <DropdownElement onClick={destroy}>
            {t('delete_product')}
          </DropdownElement>
        </Dropdown>
      </Actions>
      <Table>
        <Thead>
          <Th>
            <Checkbox
              innerRef={mainCheckbox}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                Array.from(
                  document.querySelectorAll('.child-checkbox')
                ).forEach((checkbox: HTMLInputElement | any) => {
                  checkbox.checked = event.target.checked;

                  event.target.checked
                    ? selected.add(checkbox.id)
                    : selected.delete(checkbox.id);
                });
              }}
            />
          </Th>
          <Th
            id="product_key"
            isCurrentlyUsed={sortedBy === 'product_key'}
            onColumnClick={(data: ColumnSortPayload) => {
              setSortedBy(data.field);
              setSort(data.sort);
            }}
          >
            {t('product')}
          </Th>
          <Th
            id="notes"
            isCurrentlyUsed={sortedBy === 'notes'}
            onColumnClick={(data: ColumnSortPayload) => {
              setSortedBy(data.field);
              setSort(data.sort);
            }}
          >
            {t('notes')}
          </Th>
          <Th
            id="cost"
            isCurrentlyUsed={sortedBy === 'cost'}
            onColumnClick={(data: ColumnSortPayload) => {
              setSortedBy(data.field);
              setSort(data.sort);
            }}
          >
            {t('cost')}
          </Th>
          <Th />
        </Thead>
        <Tbody>
          {!data && (
            <Tr>
              <Td colSpan={100}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {data?.data.data.length === 0 && (
            <Tr>
              <Td colSpan={100}>{t('no_results')}</Td>
            </Tr>
          )}

          {data?.data.data.map((product: any) => {
            return (
              <Tr key={product.id} isLoading={!data}>
                <Td>
                  <Checkbox
                    className="child-checkbox"
                    value={product.id}
                    id={product.id}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setSelected(
                        handleCheckboxChange(event.target.id, selected)
                      )
                    }
                  />
                </Td>
                <Td>
                  <Link
                    to={generatePath('/products/:id/edit', { id: product.id })}
                  >
                    {product.product_key}
                  </Link>
                </Td>
                <Td>{product.notes}</Td>
                <Td>{product.cost}</Td>
                <Td>
                  <Dropdown className="divide-y" label={t('select')}>
                    {!product.is_deleted && (
                      <div>
                        <DropdownElement
                          to={generatePath('/products/:id/edit', {
                            id: product.id,
                          })}
                        >
                          {t('edit_product')}
                        </DropdownElement>

                        <DropdownElement
                          to={generatePath('/products/:id/clone', {
                            id: product.id,
                          })}
                        >
                          {t('clone_product')}
                        </DropdownElement>

                        <DropdownElement>
                          {t('invoice_product')}
                        </DropdownElement>
                      </div>
                    )}

                    <div>
                      {product.archived_at === 0 && (
                        <DropdownElement
                          onClick={() => {
                            setSelected(new Set());
                            setSelected(selected.add(product.id));
                            archive();
                          }}
                        >
                          {t('archive_product')}
                        </DropdownElement>
                      )}

                      {product.archived_at > 0 && (
                        <DropdownElement
                          onClick={() => {
                            setSelected(new Set());
                            setSelected(selected.add(product.id));
                            restore();
                          }}
                        >
                          {t('restore_product')}
                        </DropdownElement>
                      )}

                      {!product.is_deleted && (
                        <DropdownElement
                          onClick={() => {
                            setSelected(new Set());
                            setSelected(selected.add(product.id));
                            destroy();
                          }}
                        >
                          {t('delete_product')}
                        </DropdownElement>
                      )}
                    </div>
                  </Dropdown>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {data && (
        <Pagination
          onRowsChange={setPerPage}
          onPageChange={setCurrentPage}
          currentPage={currentPage}
          totalPages={data?.data.meta.pagination.total_pages}
        />
      )}
    </Default>
  );
}
