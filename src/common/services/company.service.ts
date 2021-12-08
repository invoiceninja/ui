/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosResponse } from 'axios';
import { endpoint } from 'common/helpers';
import { Company } from 'common/interfaces/company.interface';
import { Service } from 'typedi';

@Service()
export class CompanyService {
  update(companyId: string, data: Partial<Company>): Promise<AxiosResponse> {
    return axios.put(
      endpoint('/api/v1/companies/:id', { id: companyId }),
      data,
      {
        headers: {
          'X-Api-Token': localStorage.getItem('X-NINJA-TOKEN') as string,
        },
      }
    );
  }
}
