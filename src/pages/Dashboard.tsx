/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from "react-router-dom";

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/app/logout">Log out</Link>
    </div>
  );
}
