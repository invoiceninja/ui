/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Header } from "./headers";

export interface WebhookConfiguration {
      return_url: string,
      post_purchase_url: string,
      post_purchase_rest_method: any,
      post_purchase_headers: Header[],
      post_purchase_body: any
}


  