import { useQuery } from 'react-query';
import { request } from '../helpers/request';
import { endpoint } from '../helpers';
import { AxiosResponse } from 'axios';
import { GenericManyResponse } from '../interfaces/generic-many-response';
import { Design } from '../interfaces/design';

export function useDisplayRunTemplateActions() {
  const { data } = useQuery(
    ['/api/v1/designs', '?template=true&status=active&sort=name|asc'],
    () =>
      request(
        'GET',
        endpoint('/api/v1/designs?template=true&status=active&sort=name|asc')
      ).then(
        (response: AxiosResponse<GenericManyResponse<Design>>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );

  return {
    shouldBeVisible: typeof data !== 'undefined' ? data.length > 0 : true,
  };
}
