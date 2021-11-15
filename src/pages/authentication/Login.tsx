import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  AuthenticationTypes,
  LoginForm,
} from "../../common/dtos/authentication";
import { AuthService } from "../../common/services/auth.service";
import { authenticate } from "../../common/stores/slices/user";

export function Login() {
  const authService = new AuthService();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const form = useFormik({
    initialValues: {
      emailAddress: "",
      password: "",
      oneTimePassword: "",
      secret: "",
    },
    onSubmit: (values: LoginForm) => {
      setMessage("");

      authService
        .login(values)
        .then((response) => {
          dispatch(
            authenticate({
              type: AuthenticationTypes.TOKEN,
              user: response.data.data[0].user,
            })
          );

          navigate("/");
        })
        .catch((error) =>
          setMessage("These credentials do not match our records.")
        );
    },
  });

  return (
    <>
      {message}
      <form onSubmit={form.handleSubmit}>
        <input
          type="email"
          id="emailAddress"
          placeholder="E-mail address"
          onChange={form.handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          onChange={form.handleChange}
        />
        <input
          type="password"
          id="oneTimePassword"
          placeholder="One Time Password (Optional)"
          onChange={form.handleChange}
        />
        <input
          type="password"
          id="secret"
          placeholder="Secret (Optional)"
          onChange={form.handleChange}
        />
        <button type="submit">Log in with e-mail</button>
      </form>
    </>
  );
}
