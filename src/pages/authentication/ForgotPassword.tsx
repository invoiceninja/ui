/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError, AxiosResponse } from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ForgotPasswordForm } from "../../common/dtos/authentication";
import { isHosted, request } from "../../common/helpers";
import { Button } from "../../components/forms/Button";
import { Input } from "../../components/forms/Input";
import { LinkStyled } from "../../components/forms/Link";
import { Message } from "../../components/forms/Message";
import { ForgotPasswordValidation } from "./common/ValidationInterface";
import { BelowForm } from "./components/BelowForm";

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

      request("POST", "/api/v1/reset_password", values)
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
      <div className="h-screen min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/">
            <img
              className="mx-auto h-12 w-auto"
              src="https://invoiceninja.github.io/assets/images/logo-rounded.png"
              alt="Invoice Ninja"
            />
          </Link>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white mx-4 lg:mx-0 py-8 px-4 border border-gray-300 rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={form.handleSubmit}>
              <div>
                <Input
                  label={t("email_address")}
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  required={true}
                  onChange={form.handleChange}
                />

                {errors?.email && (
                  <Message classNames="mt-2" type="red">
                    {errors.email}
                  </Message>
                )}
              </div>

              <Button type="submit" busy={isFormBusy} block>
                {t("recover_password")}
              </Button>
            </form>

            <BelowForm />
          </div>
          <div className="flex flex-col items-center mt-4">
            {message && (
              <Message type={message.status ? "green" : "red"}>
                {message.message}
              </Message>
            )}

            {isHosted() && (
              <LinkStyled className="mt-2" to="/login">
                {t("login")}
              </LinkStyled>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
