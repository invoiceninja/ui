/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import {
  AuthenticationTypes,
  LoginForm,
} from '../../common/dtos/authentication';
import { endpoint, isHosted } from '../../common/helpers';
import { authenticate } from '../../common/stores/slices/user';
import { AxiosError, AxiosResponse } from 'axios';
import { LoginValidation } from './common/ValidationInterface';
import { useTranslation } from 'react-i18next';
import { InputField } from '../../components/forms/InputField';
import { Button } from '../../components/forms/Button';
import { Link } from '../../components/forms/Link';
import { InputLabel } from '../../components/forms/InputLabel';
import { Alert } from '../../components/Alert';
import { HostedLinks } from './components/HostedLinks';
import { Header } from './components/Header';
import {
  changeCurrentIndex,
  updateCompanyUsers,
} from 'common/stores/slices/company-users';
import { useTitle } from 'common/hooks/useTitle';
import { CompanyUser } from 'common/interfaces/company-user';
import { request } from 'common/helpers/request';

export function Login() {
  useTitle('login');

  const dispatch = useDispatch();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<LoginValidation | undefined>(undefined);
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [t] = useTranslation();

  const form = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values: LoginForm) => {
      setMessage(undefined);
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/login'), values)
        .then((response: AxiosResponse) => {
          localStorage.removeItem('X-CURRENT-INDEX');

          let currentIndex = 0;

          const companyUsers: CompanyUser[] = response.data.data;
          const defaultCompanyId = companyUsers[0].account.default_company_id;

          currentIndex =
            companyUsers.findIndex(
              (companyUser) => companyUser.company.id === defaultCompanyId
            ) || 0;

          dispatch(
            authenticate({
              type: AuthenticationTypes.TOKEN,
              user: response.data.data[currentIndex].user,
              token: response.data.data[currentIndex].token.token,
            })
          );

          dispatch(updateCompanyUsers(response.data.data));
          dispatch(changeCurrentIndex(currentIndex));
        })
        .catch((error: AxiosError) => {
          return error.response?.status === 422
            ? setErrors(error.response.data.errors)
            : setMessage(
                error.response?.data.message ?? t('invalid_credentials')
              );
        })
        .finally(() => setIsFormBusy(false));
    },
  });

  return (
    <div className="h-screen md:bg-gray-100">
      <Header />
      <div className="flex flex-col items-center">
        <div className="bg-white mx-4 max-w-md w-full p-8 rounded md:shadow-lg">
          <h2 className="text-2xl">{t('login')}</h2>

          <form onSubmit={form.handleSubmit} className="my-6">
            <InputField
              type="email"
              label={t('email_address')}
              id="email"
              onChange={form.handleChange}
            />

            {errors?.email && (
              <Alert className="mt-2" type="danger">
                {errors.email}
              </Alert>
            )}

            <div className="flex items-center justify-between mt-4">
              <InputLabel>{t('password')}</InputLabel>
              <Link to="/recover_password">{t('forgot_password')}</Link>
            </div>

            <InputField
              type="password"
              className="mt-2"
              id="password"
              onChange={form.handleChange}
            />

            {errors?.password && (
              <Alert className="mt-2" type="danger">
                {errors.password}
              </Alert>
            )}

            {message && (
              <Alert className="mt-4" type="danger">
                {message}
              </Alert>
            )}

            <Button disabled={isFormBusy} className="mt-4" variant="block">
              {t('login')}
            </Button>
          </form>

          <div className="flex justify-center">
            {isHosted() && <Link to="/register">{t('register_label')}</Link>}
          </div>
        </div>

        {isHosted() && (
          <div className="bg-white mx-4 max-w-md w-full rounded md:shadow-lg mt-4">
            <HostedLinks />
          </div>
        )}
      </div>
    </div>
  );
}
