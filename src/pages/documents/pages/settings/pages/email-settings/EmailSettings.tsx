/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Template } from '$app/common/interfaces/docuninja/api';
import { Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { Spinner } from '$app/components/Spinner';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';

function EmailSettings() {
  const [t] = useTranslation();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [currentTemplates, setCurrentTemplates] = useState<Template[]>([]);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/templates/docuninja'],
    queryFn: async () => {
      return request(
        'GET',
        docuNinjaEndpoint('/api/templates'),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then((res) => res.data.data);
    },
    staleTime: Infinity,
  });

  const handleChangeSubject = (templateIndex: number, value: string) => {
    let updatedTemplates = cloneDeep(currentTemplates);

    updatedTemplates = updatedTemplates.map((template, index) => {
      if (index === templateIndex) {
        return { ...template, subject: value };
      }
      return template;
    });

    setCurrentTemplates(updatedTemplates);
  };

  const handleChangeBody = (templateIndex: number, value: string) => {
    let updatedTemplates = cloneDeep(currentTemplates);

    updatedTemplates = updatedTemplates.map((template, index) => {
      if (index === templateIndex) {
        return { ...template, body: value };
      }
      return template;
    });

    setCurrentTemplates(updatedTemplates);
  };

  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      request(
        'POST',
        docuNinjaEndpoint('/api/templates/bulk'),
        {
          action: 'update',
          templates: currentTemplates,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          toast.success('templates_updated');
          $refetch(['docuninja_templates']);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useEffect(() => {
    if (templates) {
      setCurrentTemplates(templates);
    }
  }, [templates]);

  useSaveBtn(
    {
      onClick: handleSave,
      disableSaveButton: isFormBusy,
    },
    [currentTemplates]
  );

  return (
    <div className="flex flex-col pt-2 pb-2">
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      )}

      {!isLoading && currentTemplates.length === 0 && (
        <div className="flex justify-center items-center py-2 px-4 sm:px-6 font-medium">
          {t('no_templates_found')}.
        </div>
      )}

      {templates &&
        !isLoading &&
        templates.map((template: Template, index: number) => (
          <Element leftSide={template.name} key={template.id}>
            <div className="flex flex-col gap-4">
              <InputField
                label={t('subject')}
                value={template.subject}
                onValueChange={(value) => handleChangeSubject(index, value)}
              />

              <InputField
                label={t('body')}
                element="textarea"
                value={template.body}
                onValueChange={(value) => handleChangeBody(index, value)}
              />
            </div>
          </Element>
        ))}
    </div>
  );
}

export default EmailSettings;
