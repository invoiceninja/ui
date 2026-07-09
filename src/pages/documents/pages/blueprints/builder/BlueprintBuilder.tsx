import {
  Builder as Builder$,
  BuilderContext,
  CreateBlueprintSignatoryProps,
  CreateClientTabProps,
  CreateDialogProps,
  SendDialogButtonProps,
  SendDialogProps,
  SignatorySelectorProps,
} from '@docuninja/builder2.0';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { useNavigate, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useDriverTour } from '$app/common/hooks/useDriverTour';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useBlueprintQuery } from '$app/common/queries/docuninja/blueprints';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { Modal } from '$app/components/Modal';
import { ResourceActions } from '$app/components/ResourceActions';
import { TabGroup } from '$app/components/TabGroup';
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
} from '$app/pages/documents/builder/components';
import { AsyncSignatorySelector } from '$app/pages/documents/common/components/AsyncSignatorySelector';
import { useActions } from '../common/hooks/useActions';
import { EditBlueprintModal } from '../edit/components/EditBlueprintModal';
import { SignatorySwap } from './Elements';

function SendDialog({ open, onOpenChange, content, action }: SendDialogProps) {
  const [t] = useTranslation();

  return (
    <Modal title={t('send_confirmation')} visible={open} onClose={onOpenChange}>
      {content}

      <div
        onClick={(event) => {
          event.stopPropagation();

          window.dispatchEvent(new CustomEvent('builder:send.document.submit'));
        }}
      >
        {action}
      </div>
    </Modal>
  );
}

function SendDialogButton({ isSubmitting }: SendDialogButtonProps) {
  const [t] = useTranslation();

  const params = useParams();

  const { data: document } = useQuery({
    queryKey: ['/api/blueprints', params.id],
    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint(
          `/api/blueprints/${params.id}?includeUrl&includePreviews`
        ),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ).then(
        (response: GenericSingleResourceResponse<Document>) =>
          response.data.data
      ),
    refetchOnWindowFocus: false,
    initialData: null,
  });

  const handleSend = async () => {
    if (!document) {
      toast.error('document_not_found');
      return;
    }

    toast.processing();

    request(
      'POST',
      docuNinjaEndpoint(`/api/blueprints/${document.id}/send`),
      {
        invitations: document.invitations || [],
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    ).then(() => {
      toast.success('document_queued_for_sending');
      $refetch(['blueprints']);
    });
  };

  return (
    <Button
      className="w-full"
      behavior="button"
      disabled={isSubmitting}
      onClick={handleSend}
      disableWithoutIcon
    >
      {t('send')}
    </Button>
  );
}

export function CreateDialog({
  open,
  onOpenChange,
  client,
  user,
}: CreateDialogProps) {
  const [t] = useTranslation();
  return (
    <Modal
      title={t('create_client_or_user')}
      visible={open}
      onClose={onOpenChange}
      withoutHorizontalPadding
      withoutVerticalMargin
    >
      <TabGroup
        tabs={[t('client'), t('user')]}
        withHorizontalPadding
        horizontalPaddingWidth="1.5rem"
        width="full"
        className="pt-3"
      >
        <div className="px-4 sm:px-6 pt-2">{client}</div>
        <div className="px-4 sm:px-6 pt-2">{user}</div>
      </TabGroup>
    </Modal>
  );
}

function CreateClientForm({ fields, errors }: CreateClientTabProps) {
  const [t] = useTranslation();

  return (
    <>
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <InputField
            label={t(field.name)}
            errorMessage={errors?.errors[field.name]}
            onValueChange={field.onValueChange}
          />
        </div>
      ))}
    </>
  );
}

function SignatorySelector({
  results,
  onSelect,
  value,
  setCreateDialogOpen,
}: SignatorySelectorProps) {
  return (
    <AsyncSignatorySelector
      results={results}
      onSelect={onSelect}
      setCreateDialogOpen={setCreateDialogOpen}
      valuePrefix="client"
    />
  );
}

function BlueprintBuilder() {
  const { t, i18n } = useTranslation();

  const { id } = useParams();
  const colors = useColorScheme();

  const { data: blueprintResponse } = useBlueprintQuery({ id });

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDocumentSaving, setIsDocumentSaving] = useState<boolean>(false);

  const [blueprint, setBlueprint] = useState<Blueprint>();

  const actions = useActions({
    onSettingsClick: () => setIsEditModalOpen(true),
  });

  useEffect(() => {
    if (blueprintResponse) {
      setBlueprint(blueprintResponse.data.data);
    }
  }, [blueprintResponse]);

  const isSmallScreen = useMediaQuery({ query: '(max-width: 640px)' });

  const pages: Page[] = [
    { name: t('templates'), href: '/docuninja/templates' },
    {
      name: blueprint?.name || t('blueprint'),
      href: route('/docuninja/templates/:id/edit', { id }),
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

  useEffect(() => {
    const refetchDocuninjaDocument = () => {
      $refetch(['blueprints']);
    };

    const handleSuccessfullySavedDocument = () => {
      toast.success('template_updated');
      $refetch(['blueprints']);
    };

    const handleFinalizeDocumentSave = () => {
      setIsDocumentSaving(false);
    };

    const handleSaveError = () => {
      setIsDocumentSaving(false);
    };

    window.addEventListener('refetch.blueprints', refetchDocuninjaDocument);

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
        'refetch.blueprints',
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

  const { preferences, update, save } = usePreferences();

  useDriverTour({
    show: !preferences.blueprint_builder_tour_shown,
    steps: [
      {
        element: '.builder-rightSide',
        popover: {
          description: t('tour_signatory_selector') as string,
          nextBtnText: t('tour_continue_select_signatory') as string,
        },
      },
      {
        element: '.builder-central',
        popover: {
          description: t('tour_document_canvas') as string,
        },
      },
      {
        element: '.builder-save-button',
        popover: {
          description: t('tour_save_document') as string,
        },
      },
    ],
    eventName: 'builder:loaded',
    options: {
      showProgress: true,
      allowClose: false,
      showButtons: ['next'],
      disableActiveInteraction: true,
      onDestroyed: () => {
        if (!preferences.blueprint_builder_tour_shown) {
          update('preferences.blueprint_builder_tour_shown', true);
          save({ silent: true });
        }
      },
    },
  });

  const navigate = useNavigate();

  return (
    <Default
      title={t('')}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex items-center gap-2">
          {blueprint?.is_template && blueprint?.template && (
            <Button
              type="secondary"
              behavior="button"
              onClick={() => {
                navigate(
                  route('/docuninja/templates/:id/editor', {
                    id,
                    state: {
                      templateHtml: blueprint.template,
                      blueprintName: blueprint.name,
                    },
                  })
                );
              }}
              disabled={isDocumentSaving}
              disableWithoutIcon
            >
              {t('edit_template')}
            </Button>
          )}

          {blueprint && (
            <ResourceActions
              resource={blueprint}
              actions={actions}
              onSaveClick={handleSave}
              disableSaveButton={isDocumentSaving}
            />
          )}
        </div>
      }
    >
      <Card
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        withoutBodyPadding
      >
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore - BuilderContext.Provider type conflict with external types */}
        <BuilderContext.Provider
          value={{
            token: localStorage.getItem('X-DOCU-NINJA-TOKEN') as string,
            document: id as string,
            events: {
              onMessage: (message) => toast.info(message),
              onMessageDismiss: () => null,
            },
            components: {
              skeleton: Loading,
              createBlueprintSignatory: CreateBlueprintSignatory,
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
                  form: CreateClientForm,
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
            blueprint: true,
            company:
              (localStorage.getItem('DOCUNINJA_COMPANY_ID') as string) ||
              undefined,
            readonly: false,
            services: {
              google: {
                appId: import.meta.env.VITE_GOOGLE_APP_ID,
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              },
            },
            translations: {
              ...i18n.getResourceBundle(i18n.language, 'translation'),
              signature: 'Signature',
            },
          }}
        >
          <Builder$ />
        </BuilderContext.Provider>
      </Card>

      {blueprint && (
        <EditBlueprintModal
          blueprint={blueprint}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </Default>
  );
}

export function CreateBlueprintSignatory({
  onClick,
}: CreateBlueprintSignatoryProps) {
  const [t] = useTranslation();

  return (
    <Button type="secondary" behavior="button" onClick={onClick}>
      {t('new_signatory')}
    </Button>
  );
}

export default BlueprintBuilder;
