/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Fragment, useState } from "react";
import classNames from "classnames";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  title?: string;
  children: any;
}

export function Default(props: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [t] = useTranslation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/app/dashboard",
      current: location.pathname === "/app/dashboard",
    },
    {
      name: "Products",
      href: "/app/products",
      current: location.pathname === "/app/products",
    },
  ];

  const userNavigation = [{ name: t("logout"), href: "/app/logout" }];

  return <></>;
}
