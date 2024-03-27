/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { emitter } from '$app';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Client } from '$app/common/interfaces/client';
import { Design } from '$app/common/interfaces/design';
import { Invoice } from '$app/common/interfaces/invoice';
import { Payment } from '$app/common/interfaces/payment';
import { Project } from '$app/common/interfaces/project';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Task } from '$app/common/interfaces/task';
import { Modal } from '$app/components/Modal';
import { Element } from '$app/components/cards';
import { Button, SelectField, SelectProps } from '$app/components/forms';
import { ComboboxAsync } from '$app/components/forms/Combobox';
import Toggle from '$app/components/forms/Toggle';
import collect from 'collect.js';
import { atom, useAtom } from 'jotai';
import { ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from 'react-query';

type ChangeTemplateResource =
  | Invoice
  | Payment
  | Client
  | PurchaseOrder
  | Project
  | Task;

export const changeTemplateModalAtom = atom<boolean>(false);
export const templatePdfUrlAtom = atom<string | null>(null);
export const isChangeTemplateVisibleAtom = atom(false);
export const changeTemplateResourcesAtom = atom<ChangeTemplateResource[]>([]);

interface Props<T = any> {
  entity: string;
  entities: T[];
  visible: boolean;
  bulkUrl: string;
  setVisible: (visible: boolean) => void;
  labelFn: (entity: T) => string | ReactNode;
}

export function ChangeTemplateModal<T = any>({
  entity,
  entities,
  visible,
  bulkUrl,
  setVisible,
  labelFn,
}: Props<T>) {
  const [t] = useTranslation();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [pdfUrl, setPdfUrl] = useAtom(templatePdfUrlAtom);

  const queryClient = useQueryClient();

  const submitBtn = useRef<HTMLButtonElement | null>(null);

  const changeTemplate = () => {
    const ids = collect(entities).pluck('id').toArray();

    setPdfUrl(null);

    toast.processing();

    request('POST', endpoint(bulkUrl), {
      ids: ids,
      entity,
      template_id: templateId,
      send_email: sendEmail,
      action: 'template',
    }).then((response) => {
      const hash = response.data.message as string;

      emitter.emit('bulk.completed');

      if (sendEmail) {
        setVisible(false);
        toast.success();

        return;
      }

      if (submitBtn.current) {
        submitBtn.current.disabled = true;
      }

      queryClient
        .fetchQuery({
          queryKey: ['reports', hash],
          queryFn: () =>
            request(
              'POST',
              endpoint(`/api/v1/templates/preview/${hash}`),
              {},
              { responseType: 'arraybuffer' }
            ).then((response) => response.data),
          retry: 10,
          retryDelay: import.meta.env.DEV ? 1000 : 5000,
        })
        .then((data) => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileUrl = URL.createObjectURL(file);

          setPdfUrl(fileUrl);

          toast.success();

          emitter.emit('bulk.completed');
        })
        .finally(() => {
          if (submitBtn.current) {
            submitBtn.current.disabled = false;
          }
        });
    });
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');

    link.download = 'template.pdf';
    link.href = url;
    link.target = '_blank';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <Modal
      title={t('load_template')}
      visible={visible}
      onClose={setVisible}
      size="small"
    >
      <Element leftSide={t('design')} noExternalPadding>
        <ComboboxAsync
          endpoint={endpoint(
            `/api/v1/designs?template=true&entities=${entity}`
          )}
          inputOptions={{
            value: templateId ?? '',
            label: '',
          }}
          entryOptions={{ id: 'id', label: 'name', value: 'id' }}
          onChange={(entry) =>
            entry.resource ? setTemplateId(entry.resource.id) : null
          }
        />
      </Element>

      <p className="capitalize">{t('entities')}:</p>

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

      <Button
        innerRef={submitBtn}
        behavior="button"
        onClick={changeTemplate}
        disabled={!templateId}
        disableWithoutIcon
      >
        {t('run_template')}
      </Button>

      {pdfUrl ? (
        <Button
          type="secondary"
          behavior="button"
          onClick={() => handleDownload(pdfUrl)}
        >
          {t('download_pdf')}
        </Button>
      ) : null}
    </Modal>
  );
}

interface CustomTemplateSelectorProps extends SelectProps {
  entity: string;
}

export function CustomTemplateSelector({
  entity,
  ...props
}: CustomTemplateSelectorProps) {
  const { t } = useTranslation();
  const { data: designs } = useQuery<Design[]>({
    queryKey: ['designs', entity],
    queryFn: () =>
      request(
        'GET',
        endpoint(`/api/v1/designs?template=true&entity=${entity}`)
      ).then((response) => response.data.data),
    staleTime: Infinity,
  });

  return (
    <SelectField label={t('select_design')} withBlank {...props}>
      {designs?.map((design, i) => (
        <option key={i} value={design.id}>
          {design.name}
        </option>
      ))}
    </SelectField>
  );
}

export function useChangeTemplate() {
  const [changeTemplateVisible, setChangeTemplateVisible] = useAtom(
    isChangeTemplateVisibleAtom
  );
  const [changeTemplateResources, setChangeTemplateResources] = useAtom(
    changeTemplateResourcesAtom
  );

  return {
    changeTemplateVisible,
    changeTemplateResources,
    setChangeTemplateVisible,
    setChangeTemplateResources,
  };
}
