/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ButtonOption, Card, CardContainer } from '@invoiceninja/cards';
import { InputField } from '@invoiceninja/forms';
import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useTitle } from 'common/hooks/useTitle';
import { TaxRate } from 'common/interfaces/tax-rate';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useBlankTaxRateQuery } from 'common/queries/tax-rates';
import { Breadcrumbs } from 'components/Breadcrumbs';
import { Container } from 'components/Container';
import { Icon } from 'components/icons/Icon';
import { Settings } from 'components/layouts/Settings';
import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useHandleChange } from './common/hooks/useHandleChange';

export function Create() {
  const { documentTitle } = useTitle('create_tax_rate');

  const [t] = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: blankTaxRate } = useBlankTaxRateQuery();

  const pages = [
    { name: t('settings'), href: '/settings' },
    { name: t('tax_settings'), href: '/settings/tax_settings' },
    { name: t('create_tax_rate'), href: '/settings/tax_rates/create' },
  ];

  const [errors, setErrors] = useState<ValidationBag>();
  const [taxRate, setTaxRate] = useState<TaxRate>();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);

  const handleChange = useHandleChange({ setErrors, setTaxRate });

  const handleSave = (
    event: FormEvent<HTMLFormElement>,
    actionType: string
  ) => {
    event.preventDefault();

    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/tax_rates'), taxRate)
        .then((response) => {
          toast.success('created_tax_rate');

          queryClient.invalidateQueries('/api/v1/tax_rates');

          if (actionType === 'save') {
            navigate(
              route('/settings/tax_rates/:id/edit', {
                id: response.data.data.id,
              })
            );
          } else {
            if (blankTaxRate) {
              setTaxRate(blankTaxRate);
            }
          }
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          } else {
            console.error(error);
            toast.error();
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
    if (blankTaxRate) {
      setTaxRate(blankTaxRate);
    }
  }, [blankTaxRate]);

  return (
    <Settings title={t('tax_rates')}>
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
              type="text"
              label={t('name')}
              value={taxRate?.name}
              onValueChange={(value) => handleChange('name', value)}
              errorMessage={errors?.errors.name}
            />

            <InputField
              required
              type="text"
              label={t('rate')}
              value={taxRate?.rate}
              onValueChange={(value) => handleChange('rate', Number(value))}
              errorMessage={errors?.errors.rate}
            />
          </CardContainer>
        </Card>
      </Container>
    </Settings>
  );
}
