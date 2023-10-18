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
import { Design } from '$app/common/interfaces/design';
import { GenericSelectorProps } from '$app/common/interfaces/generic-selector-props';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankDesignQuery } from '$app/common/queries/designs';
import { Button, InputField } from '$app/components/forms';
import { ComboboxAsync, Entry } from '$app/components/forms/Combobox';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

interface Props extends GenericSelectorProps<Design> {
  actionVisibility?: boolean;
  disableWithQueryParameter?: boolean;
}

export function DesignSelector(props: Props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [design, setDesign] = useState<Design | null>(null);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const { t } = useTranslation();
  const { data } = useBlankDesignQuery({ enabled: isModalVisible });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (data) {
      setDesign(data);
    }
  }, [data]);

  const handleCreate = () => {
    if (design) {
      toast.processing();
      setErrors(null);

      request('POST', endpoint('/api/v1/designs'), design)
        .then(() => {
          toast.success('created_design');

          window.dispatchEvent(
            new CustomEvent('invalidate.combobox.queries', {
              detail: {
                url: endpoint('/api/v1/designs'),
              },
            })
          );

          queryClient.invalidateQueries(['/api/v1/designs']);

          setDesign(null);
          setIsModalVisible(false);
        })
        .catch((e: AxiosError<ValidationBag>) => {
          if (e.response?.status === 422) {
            setErrors(e.response.data);
            toast.dismiss();
          }
        });
    }
  };

  return (
    <>
      <Modal
        title={t('new_design')}
        visible={isModalVisible}
        onClose={setIsModalVisible}
        overflowVisible
      >
        <InputField
          label={t('name')}
          onValueChange={(value) =>
            setDesign((current) => current && { ...current, name: value })
          }
          errorMessage={errors?.errors.name}
        />

        <ComboboxAsync<Design>
          endpoint={
            endpoint('/api/v1/designs?per_page=500&status=active')
          }
          onChange={(design: Entry<Design>) =>
            setDesign(
              (current) =>
                design.resource && {
                  ...design.resource,
                  name: current?.name || '',
                }
            )
          }
          inputOptions={{
            label: props.inputLabel?.toString(),
            value: design?.id || null,
          }}
          entryOptions={{
            id: 'id',
            label: 'name',
            value: 'id',
          }}
          action={{
            label: t('new_design'),
            onClick: () => setIsModalVisible(true),
            visible:
              typeof props.actionVisibility === 'undefined' ||
              props.actionVisibility,
          }}
          onDismiss={() => setDesign(null)}
          disableWithQueryParameter={props.disableWithQueryParameter}
          errorMessage={
            errors?.errors['design.header'] ||
            errors?.errors['design.body'] ||
            errors?.errors['design.footer'] ||
            errors?.errors['design.includes']
          }
        />

        <Button onClick={handleCreate}>{t('save')}</Button>
      </Modal>

      <ComboboxAsync<Design>
        endpoint={endpoint('/api/v1/designs?status=active')}
        onChange={(design: Entry<Design>) =>
          design.resource && props.onChange(design.resource)
        }
        inputOptions={{
          label: props.inputLabel?.toString(),
          value: props.value || null,
        }}
        entryOptions={{
          id: 'id',
          label: 'name',
          value: 'id',
        }}
        action={{
          label: t('new_design'),
          onClick: () => setIsModalVisible(true),
          visible:
            typeof props.actionVisibility === 'undefined' ||
            props.actionVisibility,
        }}
        onDismiss={props.onClearButtonClick}
        disableWithQueryParameter={props.disableWithQueryParameter}
        errorMessage={props.errorMessage}
      />
    </>
  );
}
