/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { docuNinjaAtom } from '$app/common/atoms/docuninja';
import { useColorScheme } from '$app/common/colors';
import { route, routeWithOrigin } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
import {
  Builder as Builder$,
  BuilderContext,
  CreateDialogProps,
  Document,
  SendDialogButtonProps,
  SendDialogProps,
} from '@docuninja/builder2.0';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSend } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { DocumentStatus } from '$app/common/interfaces/docuninja/api';
import {
  SignatorySelector,
  SignatorySwap,
} from '../pages/blueprints/builder/Elements';
import { FaFileSignature } from 'react-icons/fa';
import { ClientCreate } from '$app/pages/invoices/common/components/ClientCreate';
import {
  Alertbox,
  ConfirmationDialog,
  ConfirmationDialogButton,
  CreateDialogTabButton,
  CreateUserForm,
  DeleteButton,
  DeleteDialog,
  ImportFromGoogleDrive,
  Loading,
  RectangleSettingsButton,
  RectangleSettingsCheckbox,
  RectangleSettingsDialog,
  RectangleSettingsInput,
  RectangleSettingsLabel,
  RectangleSettingsOptionItem,
  RectangleSettingsOptionsList,
  RectangleSettingsRemoveButton,
  RectangleSettingsSaveButton,
  RectangleSettingsSelect,
  ToolboxContext,
  UninviteButton,
  UninviteDialog,
  Upload,
  UploadDialog,
  ValidationErrors,
} from './components';
import { useDriverTour } from '$app/common/hooks/useDriverTour';
import { usePreferences } from '$app/common/hooks/usePreferences';

function SendDialog({ open, onOpenChange, content, action }: SendDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal title={t('send_confirmation')} visible={open} onClose={onOpenChange}>
      {content}

      {action}
    </Modal>
  );
}

function SendDialogButton({ isSubmitting }: SendDialogButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      className="w-full"
      behavior="button"
      disabled={isSubmitting}
      onClick={() =>
        window.dispatchEvent(new CustomEvent('builder:send.document.submit'))
      }
      disableWithoutIcon
    >
      {t('send')}
    </Button>
  );
}

export function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const [t] = useTranslation();

  return (
    <ClientCreate
      isModalOpen={open}
      setIsModalOpen={onOpenChange}
      onClientCreated={(client) => {
        window.dispatchEvent(
          new CustomEvent('builder:signatory-created', {
            detail: {
              id: client.id,
              type: 'contact',
              data: client,
            },
          })
        );
      }}
    />
  );
}

function Builder() {
  const [t] = useTranslation();

  const { id } = useParams();

  const colors = useColorScheme();

  const docuninjaAccount = useAtomValue(docuNinjaAtom);

  const [entity, setEntity] = useState<Document | null>(null);
  const [isDocumentSaving, setIsDocumentSaving] = useState<boolean>(false);
  const [isDocumentSending, setIsDocumentSending] = useState<boolean>(false);

  const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });

  const { preferences, update, save } = usePreferences();

  useDriverTour({
    show: !preferences.document_builder_tour_shown,
    steps: [
      {
        element: '.builder-rightSide',
        popover: {
          description: t('tour_signatory_selector'),
          nextBtnText: t('tour_continue_select_signatory'),
        },
      },
    ],
    eventName: 'builder:loaded',
    options: {
      showProgress: false,
      allowClose: false,
      showButtons: ['next'],
      disableActiveInteraction: true,
    },
  });

  useDriverTour({
    show: !preferences.document_builder_tour_shown,
    steps: [
      {
        element: '.builder-toolbox',
        popover: {
          description: t('tour_toolbox_description') as string,
        },
      },
      {
        element: '.builder-central',
        popover: {
          description: t('tour_document_canvas') as string,
        },
      },
    ],
    eventName: 'builder:signatory-selected',
    options: {
      showProgress: true,
      allowClose: false,
      disableActiveInteraction: true,
    },
    delay: 500,
  });

  useDriverTour({
    show: !preferences.document_builder_tour_shown,
    steps: [
      {
        element: '.builder-save-button',
        popover: {
          description: t('tour_save_document') as string,
        },
      },
    ],
    eventName: 'builder:first-rectangle-drawn',
    options: {
      showProgress: false,
      allowClose: false,
      showButtons: ['next'],
      disableActiveInteraction: true,
      onDestroyed: () => {
        if (!preferences.document_builder_tour_shown) {
          update('preferences.document_builder_tour_shown', true);
          save({ silent: true });
        }
      },
    },
  });

  const pages: Page[] = [
    { name: t('docuninja'), href: '/docuninja' },
    {
      name: entity?.description || t('edit'),
      href: route('/docuninja/:id/builder', { id }),
    },
  ];

  const handleSave = () => {
    toast.processing();

    setIsDocumentSaving(true);

    window.dispatchEvent(new CustomEvent('builder:save'));
  };

  const handleSend = () => {
    window.dispatchEvent(new CustomEvent('builder:open.send.confirmation'));
  };

  const doesDocumentHaveSignatories = () => {
    const rectangles =
      entity?.files?.flatMap((file) => file.metadata?.rectangles ?? []) ?? [];

    return rectangles.length > 0;
  };

  const getDocuNinjaCompany = () => {
    return docuninjaAccount?.companies?.find(
      (company) => company.id === localStorage.getItem('DOCUNINJA_COMPANY_ID')
    );
  };

  const getInvitationId = () => {
    const currentInvitationIndex = entity?.invitations?.findIndex(
      (invitation) => invitation.user_id === docuninjaAccount?.id
    ) as unknown as number;

    if (currentInvitationIndex === -1) {
      return null;
    }

    const currentInvitation = entity?.invitations?.[currentInvitationIndex];

    if (!entity?.invitations?.[currentInvitationIndex]?.client_contact_id) {
      return currentInvitation?.id;
    }

    return null;
  };

  useEffect(() => {
    const refetchDocuninjaDocument = () => {
      $refetch(['docuninja_documents', 'docuninja_document_timeline']);
    };

    const handleSuccessfullySavedDocument = () => {
      toast.success('updated_document');
      $refetch(['docuninja_documents', 'docuninja_document_timeline']);
    };

    const handleFinalizeDocumentSave = () => {
      setIsDocumentSaving(false);
    };

    const handleSaveError = () => {
      setIsDocumentSaving(false);
    };

    window.addEventListener(
      'refetch.docuninja.document',
      refetchDocuninjaDocument
    );

    window.addEventListener(
      'builder:document.successfully.saved',
      handleSuccessfullySavedDocument
    );

    window.addEventListener(
      'builder:document.finalize.save',
      handleFinalizeDocumentSave
    );

    window.addEventListener('builder:save.error', handleSaveError);

    return () => {
      window.removeEventListener(
        'refetch.docuninja.document',
        refetchDocuninjaDocument
      );

      window.removeEventListener(
        'builder:document.successfully.saved',
        handleSuccessfullySavedDocument
      );

      window.removeEventListener(
        'builder:document.finalize.save',
        handleFinalizeDocumentSave
      );

      window.removeEventListener('builder:save.error', handleSaveError);
    };
  }, []);

  return (
    <Default
      title={t('edit_document')}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex items-center gap-2">
          {getInvitationId() && (
            <Button
              type="secondary"
              behavior="button"
              onClick={() =>
                window.open(
                  routeWithOrigin(
                    '/docuninja/sign/:document/:invitation?sig=:sig&company=:company',
                    {
                      document: id,
                      invitation: getInvitationId(),
                      sig: getInvitationId(),
                      company: getDocuNinjaCompany()?.id,
                    }
                  ),
                  '_blank'
                )
              }
              disabled={isDocumentSaving || isDocumentSending}
              disableWithoutIcon
            >
              <div>
                <Icon element={FaFileSignature} />
              </div>

              <span>{t('sign')}</span>
            </Button>
          )}

          {Boolean(
            entity &&
              (entity as Document)?.status_id <= DocumentStatus.Sent &&
              doesDocumentHaveSignatories()
          ) && (
            <Button
              type="secondary"
              behavior="button"
              onClick={handleSend}
              disabled={isDocumentSaving || isDocumentSending}
              disableWithoutIcon
            >
              <div>
                <Icon element={MdSend} />
              </div>

              <span>{t('send')}</span>
            </Button>
          )}
          <Button
            behavior="button"
            onClick={handleSave}
            disabled={isDocumentSaving}
            disableWithoutIcon
            className="builder-save-button"
          >
            {t('save')}
          </Button>
        </div>
      }
    >
      <Card
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
      >
        {/* @ts-expect-error It's safe */}
        <BuilderContext.Provider
          value={{
            token: localStorage.getItem('X-DOCU-NINJA-TOKEN') as string,
            document: id as string,
            components: {
              skeleton: Loading,
              createBlueprintSignatory: () => null,
              save: () => null,
              send: {
                trigger: () => null,
                dialog: SendDialog,
                button: SendDialogButton,
              },
              delete: {
                dialog: DeleteDialog,
                button: DeleteButton,
              },
              upload: {
                trigger: Upload,
                dialog: UploadDialog,
              },
              confirmation: {
                dialog: ConfirmationDialog,
                button: ConfirmationDialogButton,
              },
              createSignatory: {
                dialog: CreateDialog,
                client: {
                  form: () => null,
                  button: CreateDialogTabButton,
                },
                user: {
                  form: CreateUserForm,
                  button: CreateDialogTabButton,
                },
              },
              signatorySelector: SignatorySelector,
              signatorySwap: SignatorySwap,
              uninvite: {
                dialog: UninviteDialog,
                button: UninviteButton,
              },
              validationErrors: ValidationErrors,
              sign: () => null,
              toolboxContext: ToolboxContext,
              helper: () => null,
              alert: Alertbox,
              imports: {
                googleDrive: ImportFromGoogleDrive,
              },
              rectangleSettings: {
                dialog: RectangleSettingsDialog,
                save: RectangleSettingsSaveButton,
                button: RectangleSettingsButton,
                input: RectangleSettingsInput,
                label: RectangleSettingsLabel,
                checkbox: RectangleSettingsCheckbox,
                select: RectangleSettingsSelect,
                removeButton: RectangleSettingsRemoveButton,
                optionItem: RectangleSettingsOptionItem,
                optionsList: RectangleSettingsOptionsList,
              },
            },
            styles: {
              frame: {
                backgroundColor: colors.$1,
                borderBottom: `1px solid ${colors.$24}`,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                borderTopLeftRadius: '0.375rem',
                borderTopRightRadius: '0.375rem',
                height: 'max-content',
              },
              border: colors.$24,
              childrenWrapper: {
                paddingLeft: isSmallScreen ? '1rem' : '1.5rem',
                paddingRight: isSmallScreen ? '1rem' : '1.5rem',
                paddingTop: '2rem',
                paddingBottom: '3rem',
              },
              title: {
                paddingLeft: isSmallScreen ? '1rem' : '1.5rem',
                paddingRight: isSmallScreen ? '1rem' : '1.5rem',
                paddingTop: '1.25rem',
                paddingBottom: '1.25rem',
                marginTop: 0,
                fontSize: '1.125rem',
                fontWeight: 500,
                lineHeight: '1.5rem',
              },
              signatories: {
                title: {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: colors.$22,
                },
                panel: {
                  marginBottom: '0.5rem',
                },
              },
            },
            options: {
              header: {
                sticky: false,
              },
            },
            endpoint: import.meta.env.VITE_DOCUNINJA_API_URL as string,
            events: {
              onMessage: (message) => toast.success(message),
              onMessageDismiss: () => toast.dismiss(),
            },
            invoiceninja: true,
            company:
              (localStorage.getItem('DOCUNINJA_COMPANY_ID') as string) ||
              undefined,
            readonly: false,
            onEntityReady: (entity) => setEntity(entity as Document),
            services: {
              google: {
                appId: import.meta.env.VITE_GOOGLE_APP_ID,
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              },
            },
            translations: {
              element: t('element') as string,
              tips_and_notes: t('tips_and_notes') as string,
              default_checkbox_label: t('default_checkbox_label') as string,
              empty_checkbox_label: t('empty_checkbox_label') as string,
              select_needs_two_options: t('select_needs_two_options') as string,
              default_select_label: t('default_select_label') as string,
              radio_needs_two_options: t('radio_needs_two_options') as string,
              default_radio_group_label: t(
                'default_radio_group_label'
              ) as string,
              multiselect_needs_two_options: t(
                'multiselect_needs_two_options'
              ) as string,
              default_multiselect_label: t(
                'default_multiselect_label'
              ) as string,
            },
          }}
        >
          <Builder$ />
        </BuilderContext.Provider>
      </Card>
    </Default>
  );
}

export { Alertbox, ImportFromGoogleDrive } from './components';

export default Builder;
