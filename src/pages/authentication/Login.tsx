/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import {
  AuthenticationTypes,
  LoginForm,
} from "../../common/dtos/authentication";
import { endpoint, isHosted, request } from "../../common/helpers";
import { authenticate } from "../../common/stores/slices/user";
import { AxiosError, AxiosResponse } from "axios";
import { LoginValidation } from "./common/ValidationInterface";
import { useTranslation } from "react-i18next";
import Logo from "../../resources/images/invoiceninja-logo@dark.png";
import { InputField } from "../../components/forms/InputField";
import { Button } from "../../components/forms/Button";
import { Link } from "../../components/forms/Link";
import { InputLabel } from "../../components/forms/InputLabel";
import { Alert } from "../../components/Alert";
import { RootState } from "../../common/stores/store";

export function Login() {
  const colors = useSelector((state: RootState) => state.settings.colors);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<LoginValidation | undefined>(undefined);
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [t] = useTranslation();

  useEffect(() => {
    document.title = t("login");
  });

  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values: LoginForm) => {
      setMessage("");
      setErrors(undefined);
      setIsFormBusy(true);

      request("POST", endpoint("/api/v1/login"), values)
        .then((response: AxiosResponse) => {
          dispatch(
            authenticate({
              type: AuthenticationTypes.TOKEN,
              user: response.data.data[0].user,
              token: response.data.data[0].token.token,
            })
          );
        })
        .catch((error: AxiosError) => {
          return error.response?.status === 422
            ? setErrors(error.response.data.errors)
            : setMessage(
                error.response?.data.message ?? t("invalid_credentials")
              );
        })
        .finally(() => setIsFormBusy(false));
    },
  });

  return (
    <div className="h-screen bg-gray-100">
      <div className={`bg-${colors.primary} py-1`}></div>
      <div className="flex justify-center py-8">
        <img src={Logo} alt="Invoice Ninja Logo" className="h-12" />
      </div>

      <div className="flex flex-col items-center">
        <div className="bg-white mx-4 max-w-md w-full p-8 rounded shadow-lg">
          <h2 className="text-2xl">{t("login")}</h2>

          <form className="my-6">
            <InputField type="email" label={t("email_address")} id="email" />

            <Alert className="mt-2" type="danger">
              Field is required.
            </Alert>

            <div className="flex items-center justify-between mt-4">
              <InputLabel>{t("password")}</InputLabel>
              <Link to="/forgot-password">{t("forgot_password")}</Link>
            </div>

            <InputField type="password" className="mt-2" id="password" />

            <Alert className="mt-2" type="danger">
              Field is required.
            </Alert>

            <Button className="mt-4" variant="block">
              {t("login")}
            </Button>
          </form>
        </div>
      </div>

      {/* <form onSubmit={form.handleSubmit}>
        <input
          // error={Boolean(errors?.email)}
          // helperText={errors?.email}
          id="email"
          // label={t("email_address")}
          type="email"
          onChange={form.handleChange}
        />

        <input id="password" type="password" onChange={form.handleChange} />

        <button type="submit">{t("login")}</button>
      </form> */}

      {message && <div>{message}</div>}

      {/* <Link to="/forgot-password">{t("forgot_password")}</Link> */}

      {isHosted() && <Link to="/register">{t("register_label")}</Link>}
    </div>
  );
}
