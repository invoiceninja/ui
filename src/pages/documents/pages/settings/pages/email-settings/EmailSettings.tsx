/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */


import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Template } from '$app/common/interfaces/docuninja/api';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { variables } from '$app/pages/settings/invoice-design/customize/common/variables';
import { Variable } from '$app/pages/settings/templates-and-reminders/common/components/Variable';
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

  const colors = useColorScheme();

  return (
    <>
      <Card
        title={t('email_templates')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        withoutBodyPadding
        withoutHeaderBorder
      >
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

        {!isLoading && currentTemplates.length > 0 && (
          <TabGroup 
            tabs={currentTemplates.map(template => template.name)}
            horizontalPaddingWidth="1.5rem"
            withHorizontalPadding
            fullRightPadding
            withoutVerticalMargin
          >
            {currentTemplates.map((template, index) => (
              <div key={template.id} className="pt-4 pb-6">
                <Element leftSide={t('subject')}>
                  <InputField
                    value={template.subject}
                    onValueChange={(value) => handleChangeSubject(index, value)}
                  />
                </Element>

                <Element leftSide={t('body')}>
                  <InputField
                    element="textarea"
                    value={template.body}
                    onValueChange={(value) => handleChangeBody(index, value)}
                  />
                </Element>
              </div>
            ))}
          </TabGroup>
        )}
      </Card>

      <Card
        title={t('variables')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Element leftSide={t('company')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.docu_company.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('document')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.docu_document.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('sender')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.docu_sender.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('user')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.docu_user.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('contact')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.docu_contact.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>
      </Card>
    </>
  );
}

export default EmailSettings;
