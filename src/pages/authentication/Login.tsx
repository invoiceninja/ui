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
import { useDispatch } from "react-redux";
import {
  AuthenticationTypes,
  LoginForm,
} from "../../common/dtos/authentication";
import { endpoint, isHosted, request } from "../../common/helpers";
import { authenticate } from "../../common/stores/slices/user";
import { AxiosError, AxiosResponse } from "axios";
import { LoginValidation } from "./common/ValidationInterface";
import { useTranslation } from "react-i18next";
import { Link, Link as RouterLink } from "react-router-dom";
import Logo from "../../resources/images/invoiceninja-logox53.png";

export function Login() {
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
    <>
      <form onSubmit={form.handleSubmit}>
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
      </form>

      {message && <div>{message}</div>}

      <Link to="/forgot-password">{t("forgot_password")}</Link>

      {isHosted() && <Link to="/register">{t("register_label")}</Link>}
    </>
  );
}
