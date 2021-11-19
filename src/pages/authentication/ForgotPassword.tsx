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
import { endpoint, request } from "../../common/helpers";
import { ForgotPasswordValidation } from "./common/ValidationInterface";
import Logo from "../../resources/images/invoiceninja-logox53.png";
import { Alert, Grid, Stack, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";

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
      <div
        style={{
          backgroundColor: "#3c3b3b",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: "28px 55px",
        }}
      >
        <Link to="/">
          <img width="231" src={Logo} alt="Invoice Ninja Logo" />
        </Link>
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
            {t("password_recovery")}
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

              <LoadingButton
                type="submit"
                loading={isFormBusy}
                sx={{ mt: 2 }}
                disableElevation
                size="large"
                variant="contained"
              >
                {t("send_email")}
              </LoadingButton>
            </Stack>
          </form>

          {message && (
            <Alert
              sx={{ marginTop: 2 }}
              severity={message.status ? "success" : "error"}
            >
              {message.message}
            </Alert>
          )}
        </Grid>
      </Grid>
    </>
  );
}
