/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useFormik } from "formik";
import { useEffect, useState } from "react";
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
import { Link as RouterLink } from "react-router-dom";
import Logo from "../../resources/images/invoiceninja-logox53.png";

import {
  Grid,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

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
      <div
        style={{
          backgroundColor: "#3c3b3b",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: "28px 55px",
        }}
      >
        <RouterLink to="/">
          <img width="231" src={Logo} alt="Invoice Ninja Logo" />
        </RouterLink>
      </div>

      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={10} sm={7} md={5} lg={4}>
          <Typography
            sx={{ marginTop: 10, mx: "auto", textAlign: "center" }}
            variant="h4"
          >
            {t("account_login")}
          </Typography>

          <form onSubmit={form.handleSubmit}>
            <Stack sx={{ mt: 4 }}>
              <TextField
                error={Boolean(errors?.email)}
                helperText={errors?.email}
                id="email"
                label={t("email_address")}
                variant="outlined"
                type="email"
                onChange={form.handleChange}
              />

              <TextField
                error={Boolean(errors?.password)}
                helperText={errors?.password}
                sx={{ mt: 2 }}
                id="password"
                label={t("password")}
                variant="outlined"
                type="password"
                onChange={form.handleChange}
              />

              <LoadingButton
                type="submit"
                loading={isFormBusy}
                sx={{ mt: 2 }}
                disableElevation
                size="large"
                variant="contained"
              >
                {t("login")}
              </LoadingButton>
            </Stack>
          </form>

          {message && (
            <Alert sx={{ marginTop: 2 }} severity="error">
              {message}
            </Alert>
          )}

          <Stack
            direction="column"
            justifyContent="space-evenly"
            alignItems="center"
            sx={{ marginTop: 2 }}
          >
            <Button component={RouterLink} to="/forgot-password">
              {t("forgot_password")}
            </Button>

            {isHosted() && (
              <Button
                variant="outlined"
                component={RouterLink}
                to="/register"
                sx={{ marginTop: 2 }}
              >
                {t("register_label")}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
