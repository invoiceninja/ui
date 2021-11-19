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
import { ForgotPasswordForm } from "../../common/dtos/authentication";
import { endpoint, request } from "../../common/helpers";
import { ForgotPasswordValidation } from "./common/ValidationInterface";

interface Response {
  message: string;
  status: boolean;
}

export function ForgotPassword() {
  const [t] = useTranslation();
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [message, setMessage] = useState<Response | undefined>(undefined);
  const [errors, setErrors] = useState<ForgotPasswordValidation | undefined>(
    undefined
  );

  useEffect(() => {
    document.title = t("recover_password");
  });

  const form = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: (values: ForgotPasswordForm) => {
      setIsFormBusy(true);
      setErrors(undefined);
      setMessage(undefined);

      request("POST", endpoint("/api/v1/reset_password"), values)
        .then((response: AxiosResponse) => setMessage(response.data))
        .catch((error: AxiosError) => {
          return error.response?.status === 422
            ? setErrors(error.response?.data.errors)
            : setMessage(error.response?.data);
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

        <button type="submit">{t("send_email")}</button>
      </form>

      {message && (
        <div
        // severity={message.status ? "success" : "error"}
        >
          {message.message}
        </div>
      )}
    </>
  );
}
