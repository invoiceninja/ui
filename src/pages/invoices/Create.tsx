/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import Select from 'react-select';
import { Calendar, X } from 'react-feather';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../components/tables';
import {
  Datepicker,
  InputField,
  InputLabel,
  Link,
  Textarea,
} from '../../components/forms';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../common/stores/store';
import { updateBuilderProperty } from '../../common/stores/slices/invoices';

export function Create() {
  const [t] = useTranslation();
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
            <div className="grid grid-cols-12 flex items-center space-y-2 lg:space-y-0">
              <div className="col-span-12 lg:col-span-4">
                <p className="w-full text-sm text-gray-800 w-1/3">
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
            <div className="grid grid-cols-12 flex items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800 w-1/3">
                  {t('due_date')}
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="inline-flex items-center space-x-2 w-full">
                  <Datepicker id="due_date" />
                  <Calendar />
                </div>
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-12 flex items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800 w-1/3">
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
            <div className="grid grid-cols-12 flex items-center space-y-2 lg:space-y-0">
              <div className="col-span-12 lg:col-span-4">
                <p className="w-full text-sm text-gray-800 w-1/3">
                  {t('invoice')} #
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <InputField id="invoice_number" />
              </div>
            </div>

            {/* PO number */}
            <div className="grid grid-cols-12 flex items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800 w-1/3 uppercase">
                  {t('po')} #
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <InputField id="po_number" />
              </div>
            </div>

            {/* Due date */}
            <div className="grid grid-cols-12 flex items-center space-y-2 lg:space-y-0">
              <div className="col-span-4">
                <p className="w-full text-sm text-gray-800 w-1/3">
                  {t('discount')}
                </p>
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
      </div>
    </Default>
  );
}
