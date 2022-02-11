/**
* Invoice Ninja (https://invoiceninja.com).
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
*
* @license https://www.elastic.co/licensing/elastic-license
*/

import { useTranslation } from "react-i18next";
import { Dropdown } from "./dropdown/Dropdown"
import { DropdownElement } from "./dropdown/DropdownElement"

type Props = {
    resource:string
}

export function ResorcefulActions(props: Props) {
    const [t] = useTranslation();
    const bulk = (action: 'archive' | 'restore' | 'delete') => {
        const toastId = toast.loading(t('processing'));
    
        request(
          'POST',
          endpoint(props.bulkRoute ?? `${props.endpoint}/bulk`),
          {
            action,
            ids: Array.from(selected),
          },
          defaultHeaders
        )
          .then(() => {
            toast.success(t(`successfully_${action}_${props.resource}`), {
              id: toastId,
            });
    
            selected.clear();
    
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            /** @ts-ignore: Unreachable, if element is null/undefined. */
            mainCheckbox.current.checked = false;
          })
          .catch((error: AxiosError) => {
            console.error(error.response?.data);
    
            toast.error(t('error_title'), {
              id: toastId,
            });
          })
          .finally(() => queryClient.invalidateQueries(apiEndpoint.href));
      };
  return (
    <Dropdown label={t('actions')}>
    <DropdownElement onClick={() => bulk('archive')}>
      {t(`archive_${props.resource}`)}
    </DropdownElement>

    <DropdownElement onClick={() => bulk('restore')}>
      {t(`restore_${props.resource}`)}
    </DropdownElement>

    <DropdownElement onClick={() => bulk('delete')}>
      {t(`delete_${props.resource}`)}
    </DropdownElement>
  </Dropdown>
  )
}