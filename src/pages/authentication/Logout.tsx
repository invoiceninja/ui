/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { request } from "../../common/helpers";
import { RootState } from "../../common/stores/store";

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    request(
      "POST",
      "/api/v1/logout",
      {},
      {
        "X-Api-Token": localStorage.getItem("X-NINJA-TOKEN"),
      }
    ).then(() => {
      localStorage.removeItem("X-NINJA-TOKEN");
      navigate("/");
    });
  });

  return <div>Logging out</div>;
}
