import { useTitle } from "$app/common/hooks/useTitle";
import { Default } from "$app/components/layouts/Default";
import { useTranslation } from "react-i18next";
import { Button } from '$app/components/forms';
import { ValidationBag } from "$app/common/interfaces/validation-bag";
import { toast } from "$app/common/helpers/toast/toast";
import { AxiosError } from "axios";
import { endpoint } from "$app/common/helpers";
import { request } from "$app/common/helpers/request";
export default function Documents() {
    const { documentTitle } = useTitle('documents');
    const [t] = useTranslation();

    const pages = [{ name: t('documents'), href: '/documents' }];

    function login() {
        console.log('login');


    request('POST', endpoint('/api/docuninja/login'), {})
        .then((response) => {
            console.log(response);
            toast.success('logged in!');
            
        })
        .catch((e: AxiosError<ValidationBag>) => {
            // if (e.response?.status === 422) {
                // setErrors(e.response.data);
                // toast.dismiss();
            // }
        });

    }

    function create() {
        console.log('create');


        request('POST', endpoint('/api/docuninja/create'), {})
            .then((response) => {
                console.log(response);
                toast.success('logged in!');

            })
            .catch((e: AxiosError<ValidationBag>) => {
                // if (e.response?.status === 422) {
                // setErrors(e.response.data);
                // toast.dismiss();
                // }
            });

    

    }

    return (
        <Default title={documentTitle} breadcrumbs={pages} docsLink="en/documents">

        <div className="flex grid-cols-3 gap-4">
        
            <div>
                <Button onClick={login}>{t('login')}</Button>
            </div>

            <div>
                <Button onClick={create}>{t('create')}</Button>
            </div>



        </div>
        </Default>
    );
}