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
import { InputField } from '$app/components/forms';
import { AxiosError, AxiosResponse } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { PaymentTerm } from '$app/common/interfaces/payment-term';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankPaymentTermQuery } from '$app/common/queries/payment-terms';
import { Breadcrumbs } from '$app/components/Breadcrumbs';
import { Container } from '$app/components/Container';
import { Icon } from '$app/components/icons/Icon';
import { Settings } from '$app/components/layouts/Settings';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks/useHandleChange';
import { $refetch } from '$app/common/hooks/useRefetch';

export function Create() {
  const { documentTitle } = useTitle('create_payment_term');

  const [t] = useTranslation();
  const navigate = useNavigate();

  const { data: blankPaymentTerm } = useBlankPaymentTermQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('company_details'), href: '/settings/company_details' },
    { name: t('payment_terms'), href: '/settings/payment_terms' },
    { name: t('create_payment_term'), href: '/settings/payment_terms/create' },
  ];

  const [errors, setErrors] = useState<ValidationBag>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm>();

  const handleChange = useHandleChange({ setErrors, setPaymentTerm });

  const handleSave = (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/payment_terms'), paymentTerm)
        .then((response: AxiosResponse) => {
          toast.success('created_payment_term');

          $refetch(['payment_terms']);

          if (actionType === 'save') {
            navigate(
              route('/settings/payment_terms/:id/edit', {
                id: response.data.data.id,
              })
            );
          } else {
            if (blankPaymentTerm) {
              setPaymentTerm(blankPaymentTerm);
            }
          }
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const saveOptions: ButtonOption[] = [
    {
      onClick: (event: FormEvent<HTMLFormElement>) =>
        handleSave(event, 'create'),
      text: `${t('save')} / ${t('create')}`,
      icon: <Icon element={BiPlusCircle} />,
    },
  ];

  useEffect(() => {
    if (blankPaymentTerm) {
      setPaymentTerm(blankPaymentTerm);
    }
  }, [blankPaymentTerm]);

  return (
    <Settings title={t('payment_terms')}>
      <Container className="space-y-6">
        <Breadcrumbs pages={pages} />

        <Card
          title={documentTitle}
          withSaveButton
          disableSubmitButton={isFormBusy}
          onFormSubmit={(event) => handleSave(event, 'save')}
          onSaveClick={(event) => handleSave(event, 'save')}
          additionalSaveOptions={saveOptions}
        >
          <CardContainer>
            <InputField
              required
              value={paymentTerm?.num_days}
              type="number"
              label={t('number_of_days')}
              onValueChange={(value) => handleChange('num_days', Number(value))}
              errorMessage={errors?.errors.num_days}
            />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}
