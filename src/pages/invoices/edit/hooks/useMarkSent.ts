/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from "common/helpers";
import { request } from "common/helpers/request";
import { Invoice } from "common/interfaces/invoice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { generatePath } from "react-router-dom";

export function useMarkSent() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return (invoice: Invoice) => {
    const toastId = toast.loading(t("processing"));

    request(
      "PUT",
      endpoint("/api/v1/invoices/:id?mark_sent=true", { id: invoice.id }),
      invoice,
    )
      .then(() => {
        toast.success(t("notification_invoice_sent"), { id: toastId });

        queryClient.invalidateQueries("/api/v1/invoices");

        queryClient.invalidateQueries(
          generatePath("/api/v1/invoices/:id", { id: invoice.id }),
        );
      })
      .catch((error) => {
        toast.error(t("error_title"), { id: toastId });

        console.error(error);
      });
  };
}
