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
import { RootState } from "../common/stores/store";
import Client from "../common/dtos/client";

export function GetSetting(Client: client setting: string) {

  const settings = useSelector((state: RootState) => state.settings);

  if(typeof client.settings === 'object' && hasOwnProperty(client.settings, setting)) {
    return client.settings[setting];
  }

  if(typeof client.group_settings === 'object' && hasOwnProperty(client.group_settings, setting)) {
    return client.group_settings[setting];
  }

  return settings[setting];

}
