import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { ValidationAlert } from '$app/components/ValidationAlert';
import { useAtom } from 'jotai';
import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { useColorScheme } from '$app/common/colors';

function EmailSettings() {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const [customSendingEmail, setCustomSendingEmail] = useState('');
  const [emailFromName, setEmailFromName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');

  const [docuData] = useAtom(docuNinjaAtom);
  const docuCompany = docuData?.companies?.[0];
  const id = docuCompany?.id;

  useEffect(() => {
    if (docuCompany?.settings) {
      setCustomSendingEmail(docuCompany.settings.custom_sending_email ?? '');
      setEmailFromName(docuCompany.settings.email_from_name ?? '');
      setReplyToEmail(docuCompany.settings.reply_to_email ?? '');
    }
  }, [docuCompany?.settings]);

  const handleSave = () => {
    if (!isFormBusy) {
      setIsFormBusy(true);
      toast.processing();

      const updatedCompany = cloneDeep(docuCompany);
      
      if (updatedCompany) {
        updatedCompany.settings.custom_sending_email = customSendingEmail || null;
        updatedCompany.settings.email_from_name = emailFromName || null;
        updatedCompany.settings.reply_to_email = replyToEmail || null;
      }

      request(
        'PUT',
        docuNinjaEndpoint('/api/companies/:id', {
          id: id,
        }),
        updatedCompany,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      )
        .then(() => {
          toast.success('updated_company');
          $refetch(['docuninja_login']);
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            setErrors(error.response.data);
            const errorMessage = error.response.data.message || 'validation_errors';
            toast.error(errorMessage);
          } else {
            toast.error('error_title');
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  useSaveBtn(
    {
      onClick: handleSave,
      disableSaveButton: isFormBusy,
    },
    [isFormBusy]
  );

  return (
    <>
      {errors && <ValidationAlert errors={errors} />}

      <Card
        title={t('email_settings')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Element
          leftSide={
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {t('from_email')}
              </span>
              <span className="text-xs text-gray-500">
                Custom sender email address for outgoing document emails.
              </span>
            </div>
          }
        >
          <InputField
            value={customSendingEmail}
            onValueChange={setCustomSendingEmail}
            disabled={isFormBusy}
            placeholder="you@yourdomain.com"
          />
        </Element>

        <Element
          leftSide={
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {t('from_name')}
              </span>
              <span className="text-xs text-gray-500">
                Custom sender name for outgoing document emails.
              </span>
            </div>
          }
        >
          <InputField
            value={emailFromName}
            onValueChange={setEmailFromName}
            disabled={isFormBusy}
            placeholder="Your Company Name"
          />
        </Element>

        <Element
          leftSide={
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {t('reply_to_email')}
              </span>
              <span className="text-xs text-gray-500">
                Custom reply-to email address for outgoing document emails.
              </span>
            </div>
          }
        >
          <InputField
            value={replyToEmail}
            onValueChange={setReplyToEmail}
            disabled={isFormBusy}
            placeholder="reply@yourdomain.com"
          />
        </Element>
      </Card>
    </>
  );
}

export default EmailSettings;
