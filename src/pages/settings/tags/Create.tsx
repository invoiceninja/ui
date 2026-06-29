/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ButtonOption, Card, CardContainer } from '$app/components/cards';
import { InputField, InputLabel } from '$app/components/forms';
import { AxiosError } from 'axios';
import {
  TAG_ENTITY_TYPES,
  Tag,
  TagEntityType,
} from '$app/common/interfaces/tag';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { randomTagColor } from '$app/common/helpers/tags';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankTagQuery } from '$app/common/queries/tags';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Icon } from '$app/components/icons/Icon';
import { Settings } from '$app/components/layouts/Settings';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks';
import { useColorScheme } from '$app/common/colors';

interface Props {
  entityType: TagEntityType;
  createRoute: string;
  editRoute: string;
  indexRoute: string;
  titleKey: string;
}

function Create(props: Props) {
  const { documentTitle } = useTitle('new_tag');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const colors = useColorScheme();
  const accentColor = useAccentColor();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tags'), href: '/settings/tags' },
    { name: t(props.titleKey), href: props.indexRoute },
    { name: t('new_tag'), href: props.createRoute },
  ];

  const { data: blankTag } = useBlankTagQuery(props.entityType);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [tag, setTag] = useState<Tag>();

  const handleChange = useHandleChange({
    setErrors,
    setTag,
  });

  const resetTag = () => {
    if (blankTag) {
      setTag({ ...blankTag, color: randomTagColor() });
    }
  };

  const handleSave = (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();

      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/tags'), tag)
        .then((response) => {
          toast.success('created_tag');

          $refetch(['tags']);

          if (actionType === 'save') {
            navigate(
              route(props.editRoute, {
                id: response.data.data.id,
              })
            );
          } else {
            resetTag();
          }
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            toast.dismiss();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    resetTag();
  }, [blankTag]);

  const saveOptions: ButtonOption[] = [
    {
      onClick: (event: FormEvent<HTMLFormElement>) =>
        handleSave(event, 'create'),
      text: `${t('save')} / ${t('create')}`,
      icon: <Icon element={BiPlusCircle} />,
    },
  ];

  return (
    <Settings title={t('tags')} breadcrumbs={pages}>
      <Card
        title={documentTitle}
        className="shadow-sm"
        childrenClassName="pt-4"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutBodyPadding
        withSaveButton
        disableSubmitButton={isFormBusy}
        onSaveClick={(event) => handleSave(event, 'save')}
        additionalSaveOptions={saveOptions}
      >
        <CardContainer>
          <InputField
            required
            label={t('name')}
            value={tag?.name}
            onValueChange={(value) => handleChange('name', value)}
            errorMessage={errors?.errors.name}
          />

          <div>
            <InputLabel className="mb-1">{t('color')}</InputLabel>

            <ColorPicker
              value={tag?.color || accentColor}
              onValueChange={(color) => handleChange('color', color)}
            />
          </div>
        </CardContainer>
      </Card>
    </Settings>
  );
}

export function CreateTaskTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.task}
      createRoute="/settings/tags/tasks/create"
      editRoute="/settings/tags/tasks/:id/edit"
      indexRoute="/settings/tags/tasks"
      titleKey="task_tags"
    />
  );
}

export function CreateProjectTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.project}
      createRoute="/settings/tags/projects/create"
      editRoute="/settings/tags/projects/:id/edit"
      indexRoute="/settings/tags/projects"
      titleKey="project_tags"
    />
  );
}

export function CreateInvoiceTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.invoice}
      createRoute="/settings/tags/invoices/create"
      editRoute="/settings/tags/invoices/:id/edit"
      indexRoute="/settings/tags/invoices"
      titleKey="invoice_tags"
    />
  );
}

export function CreateQuoteTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.quote}
      createRoute="/settings/tags/quotes/create"
      editRoute="/settings/tags/quotes/:id/edit"
      indexRoute="/settings/tags/quotes"
      titleKey="quote_tags"
    />
  );
}

export function CreateCreditTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.credit}
      createRoute="/settings/tags/credits/create"
      editRoute="/settings/tags/credits/:id/edit"
      indexRoute="/settings/tags/credits"
      titleKey="credit_tags"
    />
  );
}

export function CreateExpenseTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.expense}
      createRoute="/settings/tags/expenses/create"
      editRoute="/settings/tags/expenses/:id/edit"
      indexRoute="/settings/tags/expenses"
      titleKey="expense_tags"
    />
  );
}

export function CreateTransactionTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.bank_transaction}
      createRoute="/settings/tags/transactions/create"
      editRoute="/settings/tags/transactions/:id/edit"
      indexRoute="/settings/tags/transactions"
      titleKey="transaction_tags"
    />
  );
}

export function CreateRecurringInvoiceTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.recurring_invoice}
      createRoute="/settings/tags/recurring_invoices/create"
      editRoute="/settings/tags/recurring_invoices/:id/edit"
      indexRoute="/settings/tags/recurring_invoices"
      titleKey="recurring_invoice_tags"
    />
  );
}

export function CreateRecurringExpenseTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.recurring_expense}
      createRoute="/settings/tags/recurring_expenses/create"
      editRoute="/settings/tags/recurring_expenses/:id/edit"
      indexRoute="/settings/tags/recurring_expenses"
      titleKey="recurring_expense_tags"
    />
  );
}

export function CreateClientTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.client}
      createRoute="/settings/tags/clients/create"
      editRoute="/settings/tags/clients/:id/edit"
      indexRoute="/settings/tags"
      titleKey="client_tags"
    />
  );
}

export function CreateVendorTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.vendor}
      createRoute="/settings/tags/vendors/create"
      editRoute="/settings/tags/vendors/:id/edit"
      indexRoute="/settings/tags/vendors"
      titleKey="vendor_tags"
    />
  );
}

export function CreatePaymentTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.payment}
      createRoute="/settings/tags/payments/create"
      editRoute="/settings/tags/payments/:id/edit"
      indexRoute="/settings/tags/payments"
      titleKey="payment_tags"
    />
  );
}

export function CreatePurchaseOrderTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.purchase_order}
      createRoute="/settings/tags/purchase_orders/create"
      editRoute="/settings/tags/purchase_orders/:id/edit"
      indexRoute="/settings/tags/purchase_orders"
      titleKey="purchase_order_tags"
    />
  );
}

export function CreateProductTag() {
  return (
    <Create
      entityType={TAG_ENTITY_TYPES.product}
      createRoute="/settings/tags/products/create"
      editRoute="/settings/tags/products/:id/edit"
      indexRoute="/settings/tags/products"
      titleKey="product_tags"
    />
  );
}
