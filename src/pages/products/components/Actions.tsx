/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from "react-i18next";
import { Button } from "../../../components/forms/Button";
import { Checkbox } from "../../../components/forms/Checkbox";
import { Input } from "../../../components/forms/Input";

export function Actions() {
  const [t] = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <Button variant="primary">{t("invoice")}</Button>
          <Button variant="secondary">{t("archive")}</Button>
        </div>
        <div className="flex items-center mt-3 space-x-3 ml-4 -mt-1">
          <Checkbox id="status.active" label={t("active")} />
          <Checkbox id="status.archived" label={t("archived")} />
          <Checkbox id="status.deleted" label={t("deleted")} />
        </div>
      </div>

      <div className="mt-2 flex justify-between items-center">
        <Input placeholder={t("filter")} />
        <Button>{t("new_product")}</Button>
      </div>
    </div>
  );
}
