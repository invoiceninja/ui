/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { CircularProgress } from "@mui/material";

export function LoadingScreen() {
  return (
    <div style={{ position: "fixed", top: "50%", left: "50%" }}>
      <CircularProgress />
    </div>
  );
}
