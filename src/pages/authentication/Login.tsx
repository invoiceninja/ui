import { useFormik } from "formik";
import { LoginForm } from "../../common/dtos/authentication";
import { AuthService } from "../../common/services/auth.service";

export function Login() {
  const authService = new AuthService();

  const form = useFormik({
    initialValues: {
      emailAddress: "",
      password: "",
      oneTimePassword: "",
      secret: "",
    },
    onSubmit: (values: LoginForm) => {
      let attempt = authService.login(values);
    },
  });

  return (
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
  );
}
