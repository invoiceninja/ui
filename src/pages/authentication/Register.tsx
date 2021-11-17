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
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RegisterForm } from "../../common/dtos/authentication";
import { request } from "../../common/helpers";
import { register } from "../../common/stores/slices/user";
import { Button } from "../../components/forms/Button";
import { Checkbox } from "../../components/forms/Checkbox";
import { Input } from "../../components/forms/Input";
import { LinkExternal, LinkStyled } from "../../components/forms/Link";
import { Message } from "../../components/forms/Message";
import { RegisterValidation } from "./common/ValidationInterface";
import { BelowForm } from "./components/BelowForm";

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

      request("POST", "/api/v1/signup?include=token,user", values)
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
                  onChange={form.handleChange}
                  disabled={isFormBusy}
                />

                {errors?.email && (
                  <Message className="mt-2" type="red">
                    {errors.email}
                  </Message>
                )}
              </div>
              <div>
                <Input
                  label={t("password")}
                  type="password"
                  id="password"
                  disabled={isFormBusy}
                  onChange={form.handleChange}
                  required={true}
                />

                {errors?.password && (
                  <Message className="mt-2" type="red">
                    {errors.password}
                  </Message>
                )}
              </div>

              <div>
                <Input
                  label={t("confirm_password")}
                  type="password"
                  id="password_confirmation"
                  disabled={isFormBusy}
                  onChange={form.handleChange}
                />

                {errors?.password_confirmation && (
                  <Message className="mt-2" type="red">
                    {errors.password_confirmation}
                  </Message>
                )}
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="terms_of_service"
                  required={true}
                  onChange={form.handleChange}
                  label={t("i_agree_to_the")}
                />

                <LinkExternal
                  target="_blank"
                  className="ml-1 text-sm"
                  to="https://www.invoiceninja.com/terms"
                >
                  {t("terms_of_service_link")}
                </LinkExternal>
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="privacy_policy"
                  required={true}
                  onChange={form.handleChange}
                  label={`${t("i_agree_to_the")} ${t("privacy_policy_link")}`}
                />

                <LinkExternal
                  target="_blank"
                  className="ml-1 text-sm"
                  to="https://www.invoiceninja.com/privacy-policy"
                >
                  {t("privacy_policy_link")}
                </LinkExternal>
              </div>

              <Button busy={isFormBusy} block>
                {t("sign_up")}
              </Button>
            </form>

            <BelowForm />
          </div>
          <div className="flex flex-col items-center mt-4">
            {message && <Message className="bg-white" type="red">{message}</Message>}

            <LinkStyled className="mt-2" to="/login">
              {t("login")}
            </LinkStyled>
          </div>
        </div>
      </div>
    </>
  );
}
