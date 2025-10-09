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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Permission as PermissionType } from '$app/common/interfaces/docuninja/api';
import { DefaultSignature } from './DefaultSignature';
import { SignatureFontSelector } from '$app/components/SignatureFontSelector';
import { NotificationValue } from '../constants/notifications';
export interface DocuninjaUserProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  errors: ValidationBag | undefined;
  isFormBusy: boolean;
  isAdmin: boolean;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
  permissions: PermissionType[];
  setPermissions: React.Dispatch<React.SetStateAction<PermissionType[]>>;
  notifications: Record<string, string>;
  setNotifications: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  allNotificationsValue: NotificationValue;
  setAllNotificationsValue: React.Dispatch<React.SetStateAction<NotificationValue>>;
  editPage?: boolean;
}

export default function Details(props?: DocuninjaUserProps) {
  const [t] = useTranslation();
  
  if (!props) {
    return null; // Early return if no props available
  }

  const { user, setUser, errors, editPage } = props;

  const [showStoredInitials, setShowStoredInitials] = useState<boolean>(true);
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
                          type="secondary"
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
                    <>
                      <DefaultSignature
                        defaultValue=""
                        onChange={(signature) => {
                          setUser(
                            (user) =>
                              user && {
                                ...user,
                                e_signature: signature,
                              }
                          );
                        }}
                      />

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
                          type="secondary"
                          behavior="button"
                          onClick={() => {
                            document
                              .getElementById('signature-upload')
                              ?.click();
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
                    </>
                  )}
                </>
              ) : (
                <div>
                  <div className="flex justify-end mb-2">
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
                  </div>

                  <DefaultSignature
                    defaultValue=""
                    onChange={(signature) => {
                      setUser(
                        (user) =>
                          user && {
                            ...user,
                            e_signature: signature,
                          }
                      );
                    }}
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
                        type="secondary"
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

                    {user?.e_signature && (
                      <Button
                        type="primary"
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
              )}
            </div>
          </Element>

          <Element
            leftSide={t('initials')}
            leftSideHelp={t('initials_description')}
          >
            <div>
              {showStoredInitials ? (
                <>
                  {user?.e_initials ? (
                    <div>
                      <img
                        src={user.e_initials}
                        alt="Initials"
                        className="w-full max-h-32 border rounded p-2 mb-2"
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="secondary"
                          behavior="button"
                          onClick={() => {
                            setShowStoredInitials(false);
                          }}
                        >
                          {t('edit')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <DefaultSignature
                        defaultValue=""
                        onChange={(signature) => {
                          setUser(
                            (user) =>
                              user && {
                                ...user,
                                e_initials: signature,
                              }
                          );
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <Button
                          type="secondary"
                          behavior="button"
                          onClick={() => {
                            const firstName = user?.first_name || '';
                            const lastName = user?.last_name || '';
                            const initials = `${firstName.charAt(
                              0
                            )}${lastName.charAt(0)}`;

                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = 430;
                            canvas.height = 200;

                            if (ctx) {
                              const tempElement = document.createElement('div');
                              tempElement.style.fontFamily = 'Dancing Script';
                              tempElement.style.visibility = 'hidden';
                              tempElement.textContent = initials;
                              document.body.appendChild(tempElement);

                              document.fonts.ready.then(() => {
                                ctx.fillStyle = 'white';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.font = '120px "Dancing Script"';
                                ctx.fillStyle = 'black';

                                const textMetrics = ctx.measureText(initials);
                                const x =
                                  (canvas.width - textMetrics.width) / 2;
                                const y = canvas.height / 2 + 40;

                                ctx.fillText(initials, x, y);

                                const initialsImage =
                                  canvas.toDataURL('image/png');
                                setUser(
                                  (user) =>
                                    user && {
                                      ...user,
                                      e_initials: initialsImage,
                                    }
                                );
                                setShowStoredInitials(true);

                                document.body.removeChild(tempElement);
                              });
                            }
                          }}
                        >
                          {t('generate')}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div>
                  <div className="flex justify-end mb-2">
                    <Button
                      type="minimal"
                      behavior="button"
                      onClick={() => {
                        setUser(
                          (user) =>
                            user && {
                              ...user,
                              e_initials: '',
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
                  </div>

                  <DefaultSignature
                    defaultValue=""
                    onChange={(signature) => {
                      setUser(
                        (user) =>
                          user && {
                            ...user,
                            e_initials: signature,
                          }
                      );
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <Button
                      type="secondary"
                      behavior="button"
                      onClick={() => {
                        const firstName = user?.first_name || '';
                        const lastName = user?.last_name || '';
                        const initials = `${firstName.charAt(
                          0
                        )}${lastName.charAt(0)}`;

                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = 430;
                        canvas.height = 200;

                        if (ctx) {
                          const tempElement = document.createElement('div');
                          tempElement.style.fontFamily = 'Dancing Script';
                          tempElement.style.visibility = 'hidden';
                          tempElement.textContent = initials;
                          document.body.appendChild(tempElement);

                          document.fonts.ready.then(() => {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.font = '120px "Dancing Script"';
                            ctx.fillStyle = 'black';

                            const textMetrics = ctx.measureText(initials);
                            const x = (canvas.width - textMetrics.width) / 2;
                            const y = canvas.height / 2 + 40;

                            ctx.fillText(initials, x, y);

                            const initialsImage = canvas.toDataURL('image/png');
                            setUser(
                              (user) =>
                                user && {
                                  ...user,
                                  e_initials: initialsImage,
                                }
                            );
                            setShowStoredInitials(true);

                            document.body.removeChild(tempElement);
                          });
                        }
                      }}
                    >
                      {t('generate')}
                    </Button>

                    {user?.e_initials && (
                      <Button
                        type="primary"
                        behavior="button"
                        onClick={() => {
                          setShowStoredInitials(true);
                        }}
                      >
                        {t('done')}
                      </Button>
                    )}
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
