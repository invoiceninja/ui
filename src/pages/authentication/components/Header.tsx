/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../common/stores/store";
import { Link } from "../../../components/forms/Link";
import Logo from "../../../resources/images/invoiceninja-logo@dark.png";

export function Header() {
  const colors = useSelector((state: RootState) => state.settings.colors);

  return (
    <>
      <div className={`bg-${colors.primary} py-1`}></div>
      <div className="flex justify-center py-8">
        <Link to="/">
          <img src={Logo} alt="Invoice Ninja Logo" className="h-12" />
        </Link>
      </div>
    </>
  );
}
