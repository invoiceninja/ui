import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  AuthenticationTypes,
  LoginForm,
} from "../../common/dtos/authentication";
import { endpoint } from "../../common/helpers";
import { authenticate } from "../../common/stores/slices/user";
import axios, { AxiosError, AxiosResponse } from "axios";

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const form = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values: LoginForm) => {
      axios
        .post(endpoint("/api/v1/login"), values, {
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        })
        .then((response: AxiosResponse) => {
          dispatch(
            authenticate({
              type: AuthenticationTypes.TOKEN,
              user: response.data.data[0].user,
            })
          );

          localStorage.setItem(
            "X-NINJA-TOKEN",
            response.data.data[0].token.token
          );

          navigate("/");
        })
        .catch((error: AxiosError) => {
          setMessage("These credentials do not match our records.");
        });
    },
  });

  return (
    <>
      {message}
      <form onSubmit={form.handleSubmit}>
        <input
          type="email"
          id="email"
          placeholder="E-mail address"
          onChange={form.handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          onChange={form.handleChange}
        />
        <br />
        <button type="submit">Log in with e-mail</button>
      </form>
    </>
  );
}
