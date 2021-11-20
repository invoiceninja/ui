/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CommonProps from "../../common/interfaces/common-props.interface";

interface Props extends CommonProps {
  title?: string;
}

export function Default(props: Props) {
  const location = useLocation();
  const [t] = useTranslation();

  return <div>
    {props.children}
  </div>;
}
