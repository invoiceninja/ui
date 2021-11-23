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
import { CheckSquare, PlusCircle } from "react-feather";
import { useTranslation } from "react-i18next";
import CommonProps from "../../common/interfaces/common-props.interface";
import { Button } from "../forms/Button";
import { InputField } from "../forms/InputField";
import Select from "react-select";

interface Props extends CommonProps {
  options?: [];
  defaultOption?: any;
  optionsPlaceholder?: string;
  optionsMultiSelect?: boolean;
}

export function Actions(props: Props) {
  const [t] = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex items-center space-x-2">
        <Button>
          <span>{t("invoice")}</span>
          <CheckSquare size="20" />
        </Button>
        <Button type="secondary">{t("archive")}</Button>
        {props.options && (
          <Select
            defaultValue={props.defaultOption}
            placeholder={t("status")}
            options={props.options}
            isMulti={props.optionsMultiSelect}
          />
        )}
      </div>
      <div className="mt-2 md:mt-0 flex items-center space-x-4">
        <InputField id="filter" placeholder={t("filter")} />
        <Button>
          <span>{t("new_product")}</span>
          <PlusCircle size="20" />
        </Button>
      </div>
    </div>
  );
}
