/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { Default } from 'components/layouts/Default';
import { Upload } from 'pages/settings/company/documents/components/Upload';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

export function Import() {
  const [t] = useTranslation();

  // const queryClient = useQueryClient();

  // const invalidateQuery = () => {
  //   queryClient.invalidateQueries(generatePath('/api/v1/products/:id', { id }));
  // };

 return (
 /*   
{      <Upload
        endpoint={endpoint('/api/v1/products/:id/upload', { id })}
        onSuccess={invalidateQuery}
      />
}
*/
    <Default
      title={t('import')}
      onBackClick={generatePath('/clients')}
    >
hi
    </Default>

    
  );
}