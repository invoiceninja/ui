import { useQuery } from "react-query";
import { endpoint } from "$app/common/helpers";
import { request } from "$app/common/helpers/request";
import { AxiosResponse } from "axios";

export function useLogin() {

    return useQuery(
        ['/api/docuninja/login'],
        () =>
            request('POST', endpoint('/api/docuninja/login')),
        {
            staleTime: Infinity,
        }
    );
}

export function useCreate(): Promise<AxiosResponse> {
    return request('POST', endpoint('/api/docuninja/create'));
}