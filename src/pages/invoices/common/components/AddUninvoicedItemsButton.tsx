/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date } from '$app/common/helpers';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { Expense } from '$app/common/interfaces/expense';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Product } from '$app/common/interfaces/product';
import { Task } from '$app/common/interfaces/task';
import { ExpenseSelector } from '$app/components/expenses/ExpenseSelector';
import { Button } from '$app/components/forms';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { ProductSelector } from '$app/components/products/ProductSelector';
import { TabGroup } from '$app/components/TabGroup';
import { TaskSelector } from '$app/components/tasks/TaskSelector';
import { Tooltip } from '$app/components/Tooltip';
import { useInvoiceExpense } from '$app/pages/expenses/common/useInvoiceExpense';
import { useInvoiceProducts } from '$app/pages/products/common/hooks/useInvoiceProducts';
import { useInvoiceTask } from '$app/pages/tasks/common/hooks/useInvoiceTask';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import styled from 'styled-components';

const RoundButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
`;

const Div = styled.div`
  background-color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

interface Props {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
}

export function AddUninvoicedItemsButton(props: Props) {
  const [t] = useTranslation();

  const { invoice, setInvoice } = props;

  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const reactSettings = useReactSettings();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const invoiceTasks = useInvoiceTask({ onlyAddToInvoice: true });
  const { create } = useInvoiceExpense({ onlyAddToInvoice: true });
  const invoiceProducts = useInvoiceProducts({ onlyAddToInvoice: true });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);

  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleOnClose = () => {
    setIsModalOpen(false);
    setSelectedProducts([]);
  };

  const handleReset = () => {
    if (currentTabIndex === 0) {
      setSelectedProducts([]);
    } else if (currentTabIndex === 1) {
      setSelectedTasks([]);
    } else if (currentTabIndex === 2) {
      setSelectedExpenses([]);
    }
  };

  const disableSaveButton = () => {
    return (
      !selectedProducts.length &&
      !selectedTasks.filter(
        (task) =>
          !invoice?.line_items.find((lineItem) => lineItem.task_id === task.id)
      ).length &&
      !selectedExpenses.filter(
        (expense) =>
          !invoice?.line_items.find(
            (lineItem) => lineItem.expense_id === expense.id
          )
      ).length
    );
  };

  useEffect(() => {
    if (invoice) {
      setSelectedTasks([]);
      setSelectedExpenses([]);

      setInvoice(
        (current) =>
          current && {
            ...current,
            line_items: current.line_items.filter(
              (item) =>
                !selectedTasks.find((task) => task.id === item.task_id) &&
                !selectedExpenses.find(
                  (expense) => expense.id === item.expense_id
                )
            ),
          }
      );
    }
  }, [invoice?.client_id]);

  useEffect(() => {
    return () => {
      setSelectedTasks([]);
      setSelectedProducts([]);
      setSelectedExpenses([]);
    };
  }, []);

  return (
    <>
      {invoice ? (
        <div className="fixed right-10 bottom-10">
          <Tooltip
            placement="top"
            message={t('add_item') as string}
            width="auto"
            withoutArrow
            withoutWrapping
          >
            <RoundButton
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: reactSettings?.dark_mode
                  ? colors.$5
                  : accentColor,
              }}
            >
              <Icon element={MdAdd} size={25} color="white" />
            </RoundButton>
          </Tooltip>
        </div>
      ) : (
        <></>
      )}

      <Modal
        size="extraSmall"
        title={t('add_item')}
        visible={isModalOpen}
        onClose={handleOnClose}
        overflowVisible
        withoutBorderLine
        withoutVerticalMargin
        withoutHorizontalPadding
      >
        <TabGroup
          tabs={[t('products'), t('tasks'), t('expenses')]}
          width="full"
          withHorizontalPadding
          horizontalPaddingWidth="3.5rem"
          onTabChange={(tab) => setCurrentTabIndex(tab)}
        >
          <div className="flex flex-col space-y-4 pt-1 px-4">
            <ProductSelector
              label={t('products') as string}
              onChange={(product) =>
                setSelectedProducts((current) => [
                  ...current,
                  product.resource as Product,
                ])
              }
              withoutAction
              clearInputAfterSelection
              withShadow
            />

            <div className="flex flex-col space-y-0.5">
              {Boolean(selectedProducts.length) && (
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('selected_products')}
                </span>
              )}

              <div className="flex flex-col max-h-96 overflow-y-auto">
                {selectedProducts.map((product, index) => (
                  <div
                    key={`${product.id}${index}Products`}
                    className="flex items-center justify-between py-2 space-x-3"
                  >
                    <div className="flex flex-col truncate min-w-0">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {product.product_key}
                      </span>

                      <span className="text-xs" style={{ color: colors.$17 }}>
                        {product.notes}
                      </span>
                    </div>

                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedProducts((current) =>
                          current.filter(
                            (_, productIndex) => productIndex !== index
                          )
                        )
                      }
                    >
                      <CircleXMark
                        color={colors.$16}
                        hoverColor={colors.$3}
                        borderColor={colors.$5}
                        hoverBorderColor={colors.$17}
                        size="1.6rem"
                      />
                    </div>
                  </div>
                ))}

                {!selectedProducts.length && (
                  <span className="text-center font-medium">
                    {t('no_items_selected')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4 pt-1 px-4">
            {invoice?.client_id ? (
              <>
                <TaskSelector
                  label={t('tasks') as string}
                  clientId={invoice?.client_id}
                  clientStatus="uninvoiced"
                  onValueChange={(task) =>
                    setSelectedTasks((current) => [
                      ...current,
                      task.resource as Task,
                    ])
                  }
                  clearInputAfterSelection
                  exclude={[
                    ...invoice.line_items
                      .filter(
                        (lineItem) =>
                          lineItem.type_id === InvoiceItemType.Task &&
                          lineItem.task_id
                      )
                      .map((lineItem) => lineItem.task_id as string),
                    ...selectedTasks.map((task) => task.id),
                  ]}
                  withShadow
                />

                <div className="flex flex-col space-y-0.5">
                  {Boolean(selectedTasks.length) && (
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.$22 }}
                    >
                      {t('selected_tasks')}
                    </span>
                  )}

                  <div className="flex flex-col max-h-96 overflow-y-auto">
                    {selectedTasks.map((task, index) => (
                      <div
                        key={`${task.id}${index}Tasks`}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.$3 }}
                          >
                            # {task.number}
                          </span>

                          {task.date && (
                            <span
                              className="text-xs"
                              style={{ color: colors.$17 }}
                            >
                              {date(task.date, dateFormat)}
                            </span>
                          )}
                        </div>

                        {!invoice?.line_items.find(
                          (lineItem) => lineItem.task_id === task.id
                        ) && (
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedTasks((current) =>
                                current.filter(
                                  (_, taskIndex) => taskIndex !== index
                                )
                              )
                            }
                          >
                            <CircleXMark
                              color={colors.$16}
                              hoverColor={colors.$3}
                              borderColor={colors.$5}
                              hoverBorderColor={colors.$17}
                              size="1.6rem"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {!selectedTasks.length && (
                      <span className="text-center font-medium">
                        {t('no_items_selected')}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-center font-medium">
                {t('no_client_selected')}.
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-4 pt-1 px-4">
            {invoice?.client_id ? (
              <>
                <ExpenseSelector
                  label={t('expenses') as string}
                  clientId={invoice?.client_id}
                  clientStatus="uninvoiced"
                  onValueChange={(expense) =>
                    setSelectedExpenses((current) => [
                      ...current,
                      expense.resource as Expense,
                    ])
                  }
                  clearInputAfterSelection
                  exclude={[
                    ...invoice.line_items
                      .filter(
                        (lineItem) =>
                          lineItem.type_id === InvoiceItemType.Product &&
                          lineItem.expense_id
                      )
                      .map((lineItem) => lineItem.expense_id as string),
                    ...selectedExpenses.map((expense) => expense.id),
                  ]}
                  withShadow
                />

                <div className="flex flex-col space-y-0.5">
                  {Boolean(selectedExpenses.length) && (
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.$22 }}
                    >
                      {t('selected_expenses')}
                    </span>
                  )}

                  <div className="flex flex-col max-h-96 overflow-y-auto">
                    {selectedExpenses.map((expense, index) => (
                      <div
                        key={`${expense.id}${index}Expenses`}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.$3 }}
                          >
                            # {expense.number}
                          </span>

                          {expense.date && (
                            <span
                              className="text-xs"
                              style={{ color: colors.$17 }}
                            >
                              {date(expense.date, dateFormat)}
                            </span>
                          )}
                        </div>

                        {!invoice?.line_items.find(
                          (lineItem) => lineItem.expense_id === expense.id
                        ) && (
                          <div
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedExpenses((current) =>
                                current.filter(
                                  (_, expenseIndex) => expenseIndex !== index
                                )
                              )
                            }
                          >
                            <CircleXMark
                              color={colors.$16}
                              hoverColor={colors.$3}
                              borderColor={colors.$5}
                              hoverBorderColor={colors.$17}
                              size="1.6rem"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {!selectedExpenses.length && (
                      <span className="text-center font-medium">
                        {t('no_items_selected')}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <span className="text-center font-medium">
                {t('no_client_selected')}.
              </span>
            )}
          </div>
        </TabGroup>

        <div className="flex space-x-2 self-end px-4">
          <Button
            behavior="button"
            type="secondary"
            onClick={handleReset}
            disabled={disableSaveButton()}
            disableWithoutIcon
          >
            {t('reset')}
          </Button>

          <Button
            behavior="button"
            onClick={() => {
              selectedProducts.length && invoiceProducts(selectedProducts);

              const currentTasks = selectedTasks.filter(
                (task) =>
                  !invoice?.line_items.find(
                    (lineItem) => lineItem.task_id === task.id
                  )
              );

              currentTasks.length && invoiceTasks(currentTasks);

              const currentExpenses = selectedExpenses.filter(
                (expense) =>
                  !invoice?.line_items.find(
                    (lineItem) => lineItem.expense_id === expense.id
                  )
              );

              currentExpenses.length && create(currentExpenses);

              handleOnClose();
            }}
            disabled={disableSaveButton()}
            disableWithoutIcon
          >
            {t('save')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
