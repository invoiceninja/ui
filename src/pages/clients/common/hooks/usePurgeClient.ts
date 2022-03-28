import axios, { AxiosError } from "axios";
import { endpoint } from "common/helpers";
import { Client } from "common/interfaces/client";
import { defaultHeaders } from "common/queries/common/headers";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function usePurgeClient(client:Client|undefined){
    const [t]=useTranslation();
    const navigate=useNavigate()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (password: string, passwordIsRequired: boolean) => {
        const toastId = toast.loading(t('processing'));
    
        axios
          .post(
            endpoint('/api/v1/clients/:id/purge', { id: client?.id }),
            {},
            {
              headers: { 'X-Api-Password': password, ...defaultHeaders },
            }
          )
          .then(() => {
            toast.success(t('purged_client'), { id: toastId });
            navigate('/clients');
          })
          .catch((error: AxiosError | unknown) => {
            console.error(error);
    
            toast.dismiss();
            toast.error(t('error_title'));
          })
          .finally(() => {});
      };
}