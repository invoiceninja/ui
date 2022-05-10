/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { defaultHeaders } from './../queries/common/headers';
import { endpoint } from 'common/helpers';
import { Statics as IStatics } from './../interfaces/statics';
import { request } from './request';

export class Statics {
  protected static cache: IStatics;

  public static query(): Promise<IStatics> {
    if (this.cache) {
      return new Promise((resolve) => resolve(this.cache));
    }

    return request('GET', endpoint('/api/v1/statics'))
      .then((response) => (this.cache = response.data))
      .then(() => this.cache);
  }
}
