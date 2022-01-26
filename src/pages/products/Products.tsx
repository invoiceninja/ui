/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useTitle } from 'common/hooks/useTitle';

import { Default } from '../../components/layouts/Default';
<<<<<<< HEAD
import { generatePath } from 'react-router';
import { Actions } from '../../components/datatables/Actions';
import { Link, Checkbox, Button } from '@invoiceninja/forms';
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

  const pages = [{ name: t('products'), href: '/products' }];

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
=======
import { BreadcrumRecord } from 'components/Breadcrumbs';
import { DataTable, DataTableColumns } from 'components/DataTable';
import { Link } from '@invoiceninja/forms';
import { generatePath } from 'react-router-dom';

export function Products() {
  const [t] = useTranslation();
  const pages: BreadcrumRecord[] = [{ name: t('products'), href: '/products' }];

  useTitle('products');

  const columns: DataTableColumns = [
    {
      id: 'product_key',
      label: t('product_key'),
      format: (value, resource) => (
        <Link to={generatePath('/products/:id', { id: resource.id })}>
          {value}
        </Link>
      ),
    },
    {
      id: 'notes',
      label: t('notes'),
    },
    {
      id: 'cost',
      label: t('cost'),
    },
    {
      id: 'quantity',
      label: t('quantity'),
    },
>>>>>>> fb878fd10e96c5548a681376faf85d638f38e4b7
  ];

  return (
    <Default title={t('products')} breadcrumbs={pages}>
      <DataTable
        resource="product"
        columns={columns}
        endpoint="/api/v1/products"
        linkToCreate="/products/create"
        linkToEdit="/products/:id/edit"
        withResourcefulActions
      />
    </Default>
  );
}
