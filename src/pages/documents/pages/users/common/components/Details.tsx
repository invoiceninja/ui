/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Element } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { cloneDeep, set } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Permission as PermissionType,
} from '$app/common/interfaces/docuninja/api';
import { DefaultSignature } from './DefaultSignature';
import { SignatureFontSelector } from '$app/components/SignatureFontSelector';

export interface DocuninjaUserProps {
  user: User;
  setUser: Dispatch<SetStateAction<User | undefined>>;
  errors: ValidationBag | undefined;
  isFormBusy: boolean;
  isAdmin: boolean;
  setIsAdmin: Dispatch<SetStateAction<boolean>>;
  permissions: PermissionType[];
  setPermissions: Dispatch<SetStateAction<PermissionType[]>>;
  notifications: Record<string, string>;
  setNotifications: Dispatch<SetStateAction<Record<string, string>>>;
  allNotificationsValue: string;
  setAllNotificationsValue: Dispatch<SetStateAction<string>>;
  editPage?: boolean;
}

export default function Details({
  user,
  setUser,
  errors,
  editPage,
}: DocuninjaUserProps) {
  const [t] = useTranslation();

  const [showStoredSignature, setShowStoredSignature] = useState<boolean>(true);

  const handleChange = (key: keyof User, value: string) => {
    const updatedUser = cloneDeep(user) as User;

    set(updatedUser, key, value);

    setUser(updatedUser);
  };

  return (
    <>
      <Element leftSide={t('first_name')}>
        <InputField
          value={user?.first_name}
          onValueChange={(value) => handleChange('first_name', value)}
          errorMessage={errors?.errors.first_name}
        />
      </Element>

      <Element leftSide={t('last_name')}>
        <InputField
          value={user?.last_name}
          onValueChange={(value) => handleChange('last_name', value)}
          errorMessage={errors?.errors.last_name}
        />
      </Element>

      <Element leftSide={t('email')}>
        <InputField
          value={user?.email}
          onValueChange={(value) => handleChange('email', value)}
          errorMessage={errors?.errors.email}
        />
      </Element>

      {editPage && (
        <>
          <Element
            leftSide={t('signature')}
            leftSideHelp={t('signature_description')}
          >
            <div>
              {showStoredSignature ? (
                <>
                  {user?.e_signature ? (
                    <div>
                      <img
                        src={user.e_signature}
                        alt="Signature"
                        className="w-full max-h-32 border rounded p-2 mb-2"
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="minimal"
                          behavior="button"
                          onClick={() => {
                            setShowStoredSignature(false);
                          }}
                        >
                          {t('edit')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <DefaultSignature
                    width={430}
                    onChange={(signature) => {
                      setUser(
                        (user) =>
                          user && {
                            ...user,
                            e_signature: signature,
                          }
                      );
                    }}
                    defaultValue=""
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="signature-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              setUser(
                                (user) =>
                                  user && {
                                    ...user,
                                    e_signature: base64,
                                  }
                              );
                              setShowStoredSignature(true);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Button
                        type="minimal"
                        behavior="button"
                        onClick={() => {
                          document.getElementById('signature-upload')?.click();
                        }}
                      >
                        {t('upload')}
                      </Button>
                      <SignatureFontSelector
                        triggerButtonText={t('generate') as string}
                        onSignatureCreated={(signatureImage) => {
                          setUser(
                            (user) =>
                              user && {
                                ...user,
                                e_signature: signatureImage,
                              }
                          );
                          setShowStoredSignature(true);
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="minimal"
                        behavior="button"
                        onClick={() => {
                          setUser(
                            (user) =>
                              user && {
                                ...user,
                                e_signature: '',
                              }
                          );
                          const signaturePad = document.querySelector('canvas');
                          if (signaturePad) {
                            const context = signaturePad.getContext('2d');
                            context?.clearRect(
                              0,
                              0,
                              signaturePad.width,
                              signaturePad.height
                            );
                          }
                        }}
                      >
                        {t('clear')}
                      </Button>
                      <Button
                        type="minimal"
                        behavior="button"
                        onClick={() => {
                          setShowStoredSignature(true);
                        }}
                      >
                        {t('cancel')}
                      </Button>
                      {user?.e_signature && (
                        <Button
                          type="minimal"
                          behavior="button"
                          onClick={() => {
                            setShowStoredSignature(true);
                          }}
                        >
                          {t('done')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Element>
        </>
      )}
    </>
  );
}
