/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Modal } from '$app/components/Modal';
import { Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { ComboboxAsync } from '$app/components/forms/Combobox';
import Toggle from '$app/components/forms/Toggle';
import collect from 'collect.js';
import { atom } from 'jotai';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const changeTemplateModalAtom = atom<boolean>(false);

interface Props<T = any> {
  entity: string;
  entities: T[];
  visible: boolean;
  setVisible: (visible: boolean) => void;
  labelFn: (entity: T) => string | ReactNode;
}

export function ChangeTemplateModal<T = any>({
  entity,
  entities,
  visible,
  setVisible,
  labelFn,
}: Props<T>) {
  const [t] = useTranslation();
  const [designId, setDesignId] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(false);

  const queryClient = useQueryClient();

  const $changeTemplate = () => {
    const ids = collect(entities).pluck('id').toArray();

    toast.processing();

    alert(
      JSON.stringify({
        ids,
        entity,
        design_id: designId,
        send_email: sendEmail,
      })
    );

    toast.success();

    return;

    request('POST', `/api/v1/:entity/templates`, {
      ids: ids,
      entity,
    }).then((response) => {
      if (response.status === 200) {
        return toast.success();
      }

      const hash = response.data.message as string;

      queryClient
        .fetchQuery({
          queryKey: ['reports', hash],
          queryFn: () =>
            request('POST', endpoint(`/api/v1/:entity/templates/${hash}`)).then(
              (response) => response.data
            ),
          retry: 10,
          retryDelay: import.meta.env.DEV ? 1000 : 5000,
        })
        .then(() => {
          toast.success();
        });
    });
  };

  return (
    <Modal
      title={t('change_template')}
      visible={visible}
      onClose={setVisible}
      size="small"
    >
      <Element leftSide={t('design')} noExternalPadding>
        <ComboboxAsync
          endpoint={
            new URL(endpoint(`/api/v1/designs?template=true&entity=${entity}`))
          }
          inputOptions={{
            value: designId ?? '',
            label: '',
          }}
          entryOptions={{ id: 'id', label: 'name', value: 'id' }}
          onChange={(entry) =>
            entry.resource ? setDesignId(entry.resource.id) : null
          }
        />
      </Element>

      <p>The template will be applied to following invoices:</p>

      <ul>
        {entities.map((entity, i) => (
          <li key={i}>{labelFn(entity)}</li>
        ))}
      </ul>

      <Toggle
        label={t('send_email')}
        checked={sendEmail}
        onChange={setSendEmail}
      />

      <Button behavior="button" onClick={$changeTemplate}>
        {t('generate_template')}
      </Button>
    </Modal>
  );
}
