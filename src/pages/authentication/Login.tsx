import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  AuthenticationTypes,
  LoginForm,
} from "../../common/dtos/authentication";
import { isHosted, request } from "../../common/helpers";
import { authenticate } from "../../common/stores/slices/user";
import { AxiosError, AxiosResponse } from "axios";
import { Link } from "react-router-dom";
import { LinkStyled } from "../../components/forms/Link";
import { Input } from "../../components/forms/Input";
import { Checkbox } from "../../components/forms/Checkbox";
import { Button } from "../../components/forms/Button";
import { Message } from "../../components/forms/Message";
import { LoginValidation } from "./common/ValidationInterface";
import { useTranslation } from "react-i18next";
import { BelowForm } from "./components/BelowForm";

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

      request("POST", "/api/v1/login", values)
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
          if (error.response?.status === 422) {
            return setErrors(error.response.data.errors);
          }

          setMessage(t("invalid_credentials"));
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
                  onChange={form.handleChange}
                />

                {errors?.email && (
                  <Message classNames="mt-2" type="red">
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
                />

                {errors?.password && (
                  <Message classNames="mt-2" type="red">
                    {errors.password}
                  </Message>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Checkbox id="stayLoggedIn" label={t("stay_logged_in")} />

                <div className="text-sm">
                  <LinkStyled to="/forgot-password">
                    {t("forgot_password")}
                  </LinkStyled>
                </div>
              </div>

              <Button busy={isFormBusy} block>
                {t("email_sign_in")}
              </Button>
            </form>

            <BelowForm />
          </div>
          <div className="flex flex-col items-center mt-4">
            {message && <Message type="red">{message}</Message>}

            {isHosted() && (
              <LinkStyled className="mt-2" to="/register">
                {t("register_label")}
              </LinkStyled>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
