/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import classNames from 'classnames';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { defaultHeaders } from 'common/queries/common/headers';
import { ReactNode, RefObject } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';
import { Dropdown } from './dropdown/Dropdown';
import { DropdownElement } from './dropdown/DropdownElement';

type Props = {
  type: 'default' | 'bulk';
  label: string;
  resource?: any;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  selected: Set<string>;
  resourceType: string;
  linkToEdit?: string | undefined;
  endpoint: string;
  bulkRoute?: string | undefined;
  apiEndpoint: URL;
  children?: ReactNode;
  mainCheckbox: RefObject<HTMLInputElement>;
  onClick?: (action: string, payload?: unknown) => unknown;
};

export default function ResourcefulActions(props: Props) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const bulk = (action: 'archive' | 'restore' | 'delete') => {
    const toastId = toast.loading(t('processing'));

    request('POST', endpoint(props.bulkRoute ?? `${props.endpoint}/bulk`), {
      action,
      ids: Array.from(props.selected),
    })
      .then(() => {
        toast.success(t(`${action}d_${props.resourceType}`), {
          id: toastId,
        });

        props.selected.clear();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /** @ts-ignore: Unreachable, if element is null/undefined. */
        props.mainCheckbox.current.checked = false;
      })
      .catch((error: AxiosError) => {
        console.error(error.response?.data);

        toast.error(t('error_title'), {
          id: toastId,
        });
      })
      .finally(() => queryClient.invalidateQueries(props.apiEndpoint.href));
  };

  return (
    <>
      {props.type === 'default' && (
        <Dropdown
          className={classNames({ 'divide-y': props.children })}
          label={props.label}
        >
          <div>
            {props.linkToEdit && (
              <DropdownElement
                to={generatePath(props.linkToEdit, {
                  id: props.resource?.id,
                })}
              >
                {t(`edit_${props.resourceType}`)}
              </DropdownElement>
            )}
            {props.resource?.archived_at === 0 && (
              <DropdownElement
                onClick={() => {
                  props.setSelected(new Set());
                  props.setSelected(props.selected.add(props.resource?.id));

                  bulk('archive');

                  props.onClick?.('archive');
                }}
              >
                {t(`archive_${props.resourceType}`)}
              </DropdownElement>
            )}

            {props.resource?.archived_at > 0 && (
              <DropdownElement
                onClick={() => {
                  props.setSelected(new Set());
                  props.setSelected(props.selected.add(props.resource?.id));

                  bulk('restore');

                  props.onClick?.('restore');
                }}
              >
                {t(`restore_${props.resourceType}`)}
              </DropdownElement>
            )}

            {!props.resource?.is_deleted && (
              <DropdownElement
                onClick={() => {
                  props.setSelected(new Set());
                  props.setSelected(props.selected.add(props.resource?.id));

                  bulk('delete');

                  props.onClick?.('delete');
                }}
              >
                {t(`delete_${props.resourceType}`)}
              </DropdownElement>
            )}
          </div>

          <div>{props.children}</div>
        </Dropdown>
      )}
      {props.type === 'bulk' && (
        <Dropdown label={t('actions')}>
          <DropdownElement
            onClick={() => {
              bulk('archive');

              props.onClick?.('archive');
            }}
          >
            {t(`archive_${props.resourceType}`)}
          </DropdownElement>

          <DropdownElement
            onClick={() => {
              bulk('restore');

              props.onClick?.('restore');
            }}
          >
            {t(`restore_${props.resourceType}`)}
          </DropdownElement>

          <DropdownElement
            onClick={() => {
              bulk('delete');

              props.onClick?.('delete');
            }}
          >
            {t(`delete_${props.resourceType}`)}
          </DropdownElement>
          {props.children}
        </Dropdown>
      )}
    </>
  );
}
