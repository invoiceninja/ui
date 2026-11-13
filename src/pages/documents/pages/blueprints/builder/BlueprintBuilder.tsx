import {
  type AuthoredDocumentData,
  Builder as Builder$,
  BuilderContext,
  darkBuilderTheme,
  blobToBase64,
} from '@docuninja/builder2.0';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useDriverTour } from '$app/common/hooks/useDriverTour';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { useBlueprintQuery } from '$app/common/queries/docuninja/blueprints';
import { Page } from '$app/components/Breadcrumbs';
import { Card } from '$app/components/cards';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { ImportFromGoogleDrive } from '$app/pages/documents/builder/google-drive';
import { useActions } from '../common/hooks/useActions';
import { EditBlueprintModal } from '../edit/components/EditBlueprintModal';
import { SignatorySelector, SignatorySwap } from './Elements';

function Loading() {
  return (
    <div className="flex justify-center items-center py-6 sm:py-8 px-4 sm:px-6">
      <Spinner />
    </div>
  );
}

function BlueprintBuilder() {
  const { t, i18n } = useTranslation();

  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const reactSettings = useReactSettings();
  const colors = useColorScheme();

  const { data: blueprintResponse } = useBlueprintQuery({ id });

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDocumentSaving, setIsDocumentSaving] = useState<boolean>(false);

  const [blueprint, setBlueprint] = useState<Blueprint>();
  const isAuthoredDocument =
    blueprint?.template_kind === 'authored_document' ||
    Boolean(blueprint?.grapesjs);

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
      href: route(
        isAuthoredDocument
          ? '/docuninja/templates/:id/document-editor'
          : '/docuninja/templates/:id/edit',
        { id }
      ),
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

  const persistAuthoredDocument = async ({
    editorData,
    pdf,
  }: {
    editorData: AuthoredDocumentData;
    pdf: Blob;
  }) => {
    if (!id) {
      throw new Error('Blueprint ID is required');
    }

    await request(
      'PUT',
      docuNinjaEndpoint(`/api/blueprints/${id}`),
      {
        is_template: true,
        template_kind: 'authored_document',
        grapesjs: editorData,
        base64_file: await blobToBase64(pdf),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    );

    setBlueprint((current) =>
      current ? { ...current, grapesjs: editorData } : current
    );
  };

  const uploadAuthoredImage = async ({
    file,
    signal,
    onProgress,
  }: {
    file: File;
    signal?: AbortSignal;
    onProgress?: (progress: number) => void;
  }) => {
    if (!id) {
      throw new Error('Blueprint ID is required');
    }

    const payload = new FormData();
    payload.append('file', file);

    const response = await request(
      'POST',
      docuNinjaEndpoint(`/api/blueprints/${id}/assets`),
      payload,
      {
        signal,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
        onUploadProgress: ({ loaded, total }) => {
          if (total) onProgress?.(loaded / total);
        },
      }
    );

    return response.data.data as { id: string; url: string };
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

  if (!blueprint) {
    return <Loading />;
  }

  return (
    <Default
      title={t('')}
      breadcrumbs={pages}
      navigationTopRight={
        <div className="flex items-center gap-2">
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
        <BuilderContext.Provider
          value={{
            token: localStorage.getItem('X-DOCU-NINJA-TOKEN') as string,
            document: id as string,
            theme: reactSettings?.dark_mode ? darkBuilderTheme : undefined,
            events: {
              onMessage: (message) => toast.info(message),
              onMessageDismiss: () => null,
            },
            slots: {
              helper: () => null,
              signatorySelector: SignatorySelector,
              signatorySwap: SignatorySwap,
              imports: {
                googleDrive: ImportFromGoogleDrive,
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
              general: {
                backgroundColor: colors.$1,
                textColor: colors.$3,
                foregroundColor: colors.$4,
              },
            },
            options: {
              header: {
                sticky: false,
              },
              leftSidebar: {
                visible: !isAuthoredDocument,
              },
              showSaveButton: false,
              showSignButton: false,
              showSendButton: false,
            },
            endpoint: import.meta.env.VITE_DOCUNINJA_API_URL as string,
            blueprint: true,
            company:
              (localStorage.getItem('DOCUNINJA_COMPANY_ID') as string) ||
              undefined,
            readonly: false,
            authoredDocument: isAuthoredDocument
              ? {
                  data: blueprint?.grapesjs,
                }
              : undefined,
            defaultDateFormat: dateFormat as
              | 'MM/DD/YYYY'
              | 'DD/MM/YYYY'
              | 'YYYY-MM-DD',
            services: {
              google: {
                appId: import.meta.env.VITE_GOOGLE_APP_ID,
                clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              },
              authoredDocuments: isAuthoredDocument
                ? {
                    persist: persistAuthoredDocument,
                    uploadImage: uploadAuthoredImage,
                  }
                : undefined,
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

export default BlueprintBuilder;
