/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { Payment as PaymentEntity } from '$app/common/interfaces/payment';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Page } from '$app/components/Breadcrumbs';
import { Container } from '$app/components/Container';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tabs } from '$app/components/Tabs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './common/hooks/useActions';
import { useSave } from './edit/hooks/useSave';
import { useTabs } from './edit/hooks/useTabs';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '../settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

export default function Payment() {
  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { data } = usePaymentQuery({ id });

  const [paymentValue, setPaymentValue] = useState<PaymentEntity>();

  const [errors, setErrors] = useState<ValidationBag>();

  const pages: Page[] = [
    { name: t('payments'), href: '/payments' },
    {
      name: t('edit_payment'),
      href: route('/payments/:id/edit', { id: id }),
    },
  ];

  const tabs = useTabs({ payment: paymentValue });

  const onSave = useSave(setErrors);

  const actions = useActions();

  useEffect(() => {
    if (data) {
      setPaymentValue(data);
    }
  }, [data]);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  return (
    <Default
      title={t('payment')}
      breadcrumbs={pages}
      {...((hasPermission('edit_payment') || entityAssigned(paymentValue)) &&
        paymentValue && {
          onSaveClick: () => onSave(paymentValue as unknown as PaymentEntity),
          navigationTopRight: (
            <ResourceActions
              label={t('more_actions')}
              resource={paymentValue}
              actions={actions}
              cypressRef="paymentActionDropdown"
            />
          ),
          disableSaveButton: !paymentValue,
        })}
    >
      <Container>
        <Tabs tabs={tabs} disableBackupNavigation />

        <Outlet
          context={{
            errors,
            payment: paymentValue,
            setPayment: setPaymentValue,
          }}
        />
      </Container>

      <ChangeTemplateModal<PaymentEntity>
        entity="payment"
        entities={changeTemplateResources as PaymentEntity[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(payment) => `${t('number')}: ${payment.number}`}
        bulkUrl="/api/v1/payments/bulk"
      />
    </Default>
  );
}
