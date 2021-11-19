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
import { AxiosError, AxiosResponse } from "axios";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { RegisterForm } from "../../common/dtos/authentication";
import { endpoint, request } from "../../common/helpers";
import { register } from "../../common/stores/slices/user";
import { RegisterValidation } from "./common/ValidationInterface";
import Logo from "../../resources/images/invoiceninja-logox53.png";
import { Link } from "react-router-dom";

export function Register() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = t("register");
  });

  const [errors, setErrors] = useState<RegisterValidation | undefined>(
    undefined
  );

  const [isFormBusy, setIsFormBusy] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
      password_confirmation: "",
      terms_of_service: false,
      privacy_policy: false,
    },
    onSubmit(values: RegisterForm) {
      setMessage("");
      setErrors(undefined);
      setIsFormBusy(true);

      if (values.password !== values.password_confirmation) {
        setIsFormBusy(false);

        setErrors({
          password_confirmation: ["Password confirmation does not match."],
        });

        return;
      }

      request("POST", endpoint("/api/v1/signup?include=token,user"), values)
        .then((response: AxiosResponse) => {
          dispatch(
            register({
              token: response.data.data[0].token.token,
              user: response.data.data[0].user,
            })
          );
        })
        .catch((error: AxiosError) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data.errors);
          }

          setMessage(error.response?.data.message);
          setIsFormBusy(false);
        });
    },
  });

  return (
    <>
      <Link to="/">
        <img width="231" src={Logo} alt="Invoice Ninja Logo" />
      </Link>

      <form onSubmit={form.handleSubmit}>
        <input id="email" type="email" onChange={form.handleChange} />

        <input id="password" type="password" onChange={form.handleChange} />

        <input
          id="password_confirmation"
          type="password"
          onChange={form.handleChange}
        />

        <button type="submit">{t("register")}</button>
      </form>

      {message && <div>{message}</div>}

      <Link to="/login">{t("login")}</Link>
    </>
  );
}
