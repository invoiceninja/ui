/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { Payment as PaymentEntity } from 'common/interfaces/payment';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Page } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Default } from 'components/layouts/Default';
import { ResourceActions } from 'components/ResourceActions';
import { Tab, Tabs } from 'components/Tabs';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks/useActions';
import { useSave } from './edit/hooks/useSave';

export function Payment() {
  const [t] = useTranslation();

  const { id } = useParams();

  const [paymentValue, setPaymentValue] = useState<PaymentEntity>();

  const [errors, setErrors] = useState<ValidationBag>();

  const pages: Page[] = [
    { name: t('payments'), href: '/payments' },
    {
      name: t('edit_payment'),
      href: route('/payments/:id/edit', { id: id }),
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/payments/:id/edit', { id }),
    },
    {
      name: t('documents'),
      href: route('/payments/:id/documents', { id }),
    },
    {
      name: t('custom_fields'),
      href: route('/payments/:id/payment_fields', { id }),
    },
  ];

  const onSave = useSave(setErrors);

  const actions = useActions();

  return (
    <Default
      title={t('payment')}
      breadcrumbs={pages}
      onSaveClick={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(paymentValue as unknown as PaymentEntity);
      }}
      disableSaveButton={!paymentValue}
      navigationTopRight={
        paymentValue && (
          <ResourceActions
            label={t('more_actions')}
            resource={paymentValue}
            actions={actions}
          />
        )
      }
    >
      <Container>
        <Tabs tabs={tabs} />

        <Outlet
          context={{
            errors,
            payment: paymentValue,
            setPayment: setPaymentValue,
          }}
        />
      </Container>
    </Default>
  );
}
