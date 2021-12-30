/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import Select from 'react-select';
import { Calendar } from 'react-feather';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../components/tables';
import {
  Button,
  Datepicker,
  InputField,
  InputLabel,
  Link,
  Textarea,
} from '../../components/forms';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../common/stores/store';
import { updateBuilderProperty } from '../../common/stores/slices/invoices';
import { Breadcrumbs } from 'components/Breadcrumbs';

export function Create() {
  const [t] = useTranslation();

  const pages = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('create_invoice'), href: '/invoices/create' },
  ];

  const dispatch = useDispatch();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('new_invoice')}`;
  });

  const discountOptions = [
    { value: 'percent', label: t('percent') },
    { value: 'amount', label: t('amount') },
  ];

  const invoices = useSelector((state: RootState) => state.invoices);

  return (
    <Default title={t('new_invoice')}>
      <Breadcrumbs pages={pages} />

      <div className="bg-white shadow rounded">
        {/* Client, invoice date & invoice properties */}
        <div className="grid grid-cols-12 p-6 lg:p-8">
          {/* Client section */}
          <div className="col-span-12 lg:col-span-3">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
              <InputLabel>{t('client')}</InputLabel>
              <Select
                noOptionsMessage={() => t('no_results')}
                className="flex-1"
                placeholder={''}
              />
            </div>

            <div className="mt-4">
              <Link to="/clients/create" className="mt-4">
                {t('create_new_client')}
              </Link>
            </div>
          </div>

          {/* Invoice section #1 */}
          <div className="col-span-12 lg:col-start-5 lg:col-span-3 space-y-4 mt-10 lg:mt-0">
            {/* Invoice date */}
            <div className="grid grid-cols-12 items-center space-y-2 lg:space-y-0">
              <div className="col-span-12 lg:col-span-4">
                <p className="w-full text-sm text-gray-800">
                  {t('invoice_date')}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="inline-flex items-center space-x-2 w-full">
                  <Datepicker id="invoice_date" />
                  <Calendar />
                </div>
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-12 items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800">{t('due_date')}</p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="inline-flex items-center space-x-2 w-full">
                  <Datepicker id="due_date" />
                  <Calendar />
                </div>
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-12 items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800">
                  {t('partial_deposit')}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <InputField id="partial" />
              </div>
            </div>
          </div>

          {/* Invoice section #2 */}
          <div className="col-span-12 lg:col-start-9 lg:col-span-3 space-y-4 mt-10 lg:mt-0">
            {/* Invoice number */}
            <div className="grid grid-cols-12 items-center space-y-2 lg:space-y-0">
              <div className="col-span-12 lg:col-span-4">
                <p className="w-full text-sm text-gray-800">{t('invoice')} #</p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <InputField id="invoice_number" />
              </div>
            </div>

            {/* PO number */}
            <div className="grid grid-cols-12 items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800 uppercase">
                  {t('po')} #
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <InputField id="po_number" />
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-12 items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800">{t('discount')}</p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <InputField id="discount" />
                  </div>
                  <div className="col-auto">
                    <Select
                      options={discountOptions}
                      defaultValue={discountOptions[0]}
                      noOptionsMessage={() => t('no_results')}
                      className="flex-1"
                      placeholder={''}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="p-6 lg:p-8">
          <Table>
            <Thead>
              <Th className="w-1/4">{t('item')}</Th>
              <Th className="w-1/2">{t('description')}</Th>
              <Th className="w-1/12">{t('unit_cost')}</Th>
              <Th className="w-1/12">{t('quantity')}</Th>
              <Th>{t('total')}</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {invoices.builder.items.map((item, index) => {
                return (
                  <Tr key={index}>
                    <Td>
                      <InputField
                        onChange={(e: any) =>
                          dispatch(
                            updateBuilderProperty({
                              itemIndex: index,
                              field: 'product_key',
                              value: e.target.value,
                            })
                          )
                        }
                        id="product_key"
                        value={item.product_key}
                      />
                    </Td>
                    <Td>
                      <Textarea
                        rows={1}
                        id="description"
                        value={item.description}
                      />
                    </Td>
                    <Td>
                      <InputField
                        onChange={(e: any) =>
                          dispatch(
                            updateBuilderProperty({
                              itemIndex: index,
                              field: 'unit_cost',
                              value: e.target.value,
                            })
                          )
                        }
                        id="unit_cost"
                        value={item.unit_cost}
                      />
                    </Td>
                    <Td>
                      <InputField
                        onChange={(e: any) =>
                          dispatch(
                            updateBuilderProperty({
                              itemIndex: index,
                              field: 'quantity',
                              value: e.target.value,
                            })
                          )
                        }
                        id="quantity"
                        value={item.quantity}
                      />
                    </Td>
                    <Td>
                      {item.unit_cost * item.quantity > 0 &&
                        item.unit_cost * item.quantity}
                    </Td>
                    <Td></Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </div>

        {/* Public & private notes, terms, footer & totals */}
        <div className="flex flex-col lg:flex-row lg:justify-between p-6 space-y-6 lg:space-y-0 lg:p-8 lg:items-start lg:ml-6 lg:mr-10">
          <div className="flex flex-col">
            <div className="flex flex-row items-center space-x-4">
              <nav className="flex space-x-4" aria-label="Tabs">
                <button className="bg-gray-100 text-gray-700 px-3 py-2 font-medium text-sm rounded">
                  Public notes
                </button>

                <button className="text-gray-500 hover:text-gray-700 px-3 py-2 font-medium text-sm rounded">
                  Private notes
                </button>

                <button className="text-gray-500 hover:text-gray-700 px-3 py-2 font-medium text-sm rounded">
                  Terms
                </button>

                <button className="text-gray-500 hover:text-gray-700 px-3 py-2 font-medium text-sm rounded">
                  Footer
                </button>
              </nav>
            </div>
            <div className="mt-2">
              <Textarea />
            </div>
          </div>
          <div className="w-full lg:w-64">
            <div className="flex justify-between items-center py-4 border-b">
              <p>{t('subtotal')}</p>
              <p>$0</p>
            </div>

            <div className="flex justify-between items-center py-4 border-b">
              <p>{t('paid_to_date')}</p>
              <p>$0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 justify-center my-10">
        <Button type="secondary">{t('save_draft')}</Button>
        <Button type="secondary">{t('email_invoice')}</Button>
        <Button>{t('mark_sent')}</Button>
      </div>

      <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-32 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <span className="mt-2 block text-sm font-medium text-gray-900">
          Placeholder for invoice
        </span>
      </div>
    </Default>
  );
}
