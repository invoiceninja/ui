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
import {
  DebouncedCombobox,
  Record,
} from '$app/components/forms/DebouncedCombobox';
import { Modal } from '$app/components/Modal';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function DesignSelector(props: GenericSelectorProps<Design>) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [design, setDesign] = useState<Design | null>(null);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const { t } = useTranslation();
  const { data } = useBlankDesignQuery({ enabled: isModalVisible });

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

          setDesign(null);
          setIsModalVisible(false);
        })
        .catch((e: AxiosError<ValidationBag>) => {
          if (e.response?.status === 422) {
            setErrors(e.response.data);

            return toast.dismiss();
          }

          toast.error();
          console.error(e);
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

        <DebouncedCombobox
          {...props}
          value="id"
          endpoint="/api/v1/designs?per_page=500"
          label="name"
          defaultValue={props.value}
          onChange={(design: Record<Design>) =>
            setDesign((current) => {
              if (current && design.resource?.design) {
                return { ...current, design: design.resource.design };
              }

              return current;
            })
          }
          inputLabel={t('design')}
          errorMessage={
            errors?.errors['design.header'] ||
            errors?.errors['design.body'] ||
            errors?.errors['design.footer'] ||
            errors?.errors['design.includes']
          }
        />

        <Button onClick={handleCreate}>{t('save')}</Button>
      </Modal>

      <DebouncedCombobox
        {...props}
        value="id"
        endpoint="/api/v1/designs"
        label="name"
        defaultValue={props.value}
        onChange={(design: Record<Design>) => {
          design.resource && props.onChange(design.resource);
        }
        }
        actionLabel={t('new_design')}
        onActionClick={() => setIsModalVisible(true)}
      />
    </>
  );
}
