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
import { RegisterForm } from "../../common/dtos/authentication";
import { endpoint, request } from "../../common/helpers";
import { register } from "../../common/stores/slices/user";
import { RegisterValidation } from "./common/ValidationInterface";
import Logo from "../../resources/images/invoiceninja-logox53.png";
import { Link } from "react-router-dom";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  TextField,
  Typography,
  Link as LinkComponent,
  Alert,
  Button
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

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
            variant="h5"
          >
            {t("register_label")}
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
                sx={{ mt: 2 }}
                error={Boolean(errors?.password)}
                helperText={errors?.password}
                id="password"
                label={t("password")}
                variant="outlined"
                type="password"
                onChange={form.handleChange}
              />

              <TextField
                sx={{ mt: 2 }}
                error={Boolean(errors?.password_confirmation)}
                helperText={errors?.password_confirmation}
                id="password_confirmation"
                label={t("confirm_password")}
                variant="outlined"
                type="password"
                onChange={form.handleChange}
              />

              <FormGroup sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      required
                      id="terms_of_service"
                      onChange={form.handleChange}
                    />
                  }
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>{t("i_agree_to_the")}</span>
                      <LinkComponent
                        target="_blank"
                        href="https://www.invoiceninja.com/terms"
                        style={{ marginLeft: 5 }}
                      >
                        {t("terms_of_service_link")}
                      </LinkComponent>
                    </div>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      required
                      id="privacy_policy"
                      onChange={form.handleChange}
                    />
                  }
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>{t("i_agree_to_the")}</span>
                      <LinkComponent
                        target="_blank"
                        href="https://www.invoiceninja.com/privacy-policy"
                        style={{ marginLeft: 5 }}
                      >
                        {t("privacy_policy_link")}
                      </LinkComponent>
                    </div>
                  }
                />
              </FormGroup>

              <LoadingButton
                type="submit"
                loading={isFormBusy}
                sx={{ mt: 2 }}
                disableElevation
                size="large"
                variant="contained"
              >
                {t("register")}
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
            <Button component={Link} to="/login">
              {t("login")}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
