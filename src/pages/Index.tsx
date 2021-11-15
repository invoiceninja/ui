import { Link } from "react-router-dom";

export function Index() {
  return (
    <div>
      <h1>Invoice Ninja</h1>

      <Link to="/login">Login</Link>
    </div>
  );
}
