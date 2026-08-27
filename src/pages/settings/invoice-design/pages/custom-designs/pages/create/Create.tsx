/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Editor } from '@monaco-editor/react';
import { AxiosError } from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { useColorScheme } from '$app/common/colors';
import { DesignSelector } from '$app/common/generic/DesignSelector';
import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Design } from '$app/common/interfaces/design';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  useBlankDesignQuery,
  useDesignsQuery,
} from '$app/common/queries/designs';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { Card, Element } from '$app/components/cards';
import { Checkbox, InputField } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { InvoiceViewer } from '$app/pages/invoices/common/components/InvoiceViewer';
import { Panel } from '../edit/components/Panel';
import { PanelGroup } from '../edit/components/PanelGroup';
import { PanelResizeHandle } from '../edit/components/PanelResizeHandle';
import {
  getCustomDesignCreationType,
  prepareDesignForCreation,
} from './create-design';

export const templateEntites = [
  'invoice',
  'payment',
  'client',
  'quote',
  'credit',
  'purchase_order',
  'project',
  'task',
  'expense',
];

export default function Create() {
  const { t } = useTranslation();

  const colors = useColorScheme();

  const { data } = useBlankDesignQuery();
  const { data: availableDesigns } = useDesignsQuery();
  const [searchParams] = useSearchParams();
  const type = getCustomDesignCreationType(searchParams);

  const [design, setDesign] = useState<Design | null>(null);
  const [previewDesign, setPreviewDesign] = useState<Design | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag | null>(null);
  const hasSelectedDefaultDesign = useRef(false);

  const handleChange = <T extends keyof Design>(key: T, value: Design[T]) => {
    setDesign((current) => current && { ...current, [key]: value });
  };

  useEffect(() => {
    if (data) {
      const draft = prepareDesignForCreation(data, type);

      setDesign(
        type === 'design' && selectedDesign
          ? { ...draft, design: selectedDesign.design }
          : draft
      );
    }
  }, [data, type]);

  useEffect(() => {
    hasSelectedDefaultDesign.current = false;
    setSelectedDesign(null);
  }, [type]);

  useEffect(() => {
    if (
      type === 'design' &&
      availableDesigns?.length &&
      !hasSelectedDefaultDesign.current
    ) {
      hasSelectedDefaultDesign.current = true;
      setSelectedDesign(availableDesigns[0]);
    }
  }, [availableDesigns, type]);

  useEffect(() => {
    if (type === 'design' && selectedDesign) {
      setDesign(
        (current) => current && { ...current, design: selectedDesign.design }
      );
    }
  }, [selectedDesign, type]);

  useDebounce(() => setPreviewDesign(design), 500, [design]);

  const previewPayload = useMemo(
    () => ({
      design: previewDesign,
      entity_id: '-1',
      entity: 'invoice' as const,
    }),
    [previewDesign]
  );

  const canPreview =
    Boolean(previewDesign) && (type === 'template' || Boolean(selectedDesign));

  const navigate = useNavigate();

  useSaveBtn(
    {
      onClick() {
        if (isFormBusy) {
          return;
        }

        setIsFormBusy(true);
        toast.processing();
        setErrors(null);

        request('POST', endpoint('/api/v1/designs'), design)
          .then((response: GenericSingleResourceResponse<Design>) => {
            toast.success('saved_design');

            $refetch(['designs']);

            navigate(
              route('/settings/invoice_design/custom_designs/:id/edit', {
                id: response.data.data.id,
              })
            );
          })
          .catch((e: AxiosError<ValidationBag>) => {
            if (e.response?.status === 422) {
              toast.dismiss();
              setErrors(e.response.data);
            }
          })
          .finally(() => setIsFormBusy(false));
      },
      disableSaveButton: (!proPlan() && !enterprisePlan()) || isFormBusy,
    },
    [design, isFormBusy]
  );

  const handleResourceChange = (value: string, checked: boolean) => {
    if (!design) {
      return;
    }

    const entities =
      design.entities.length > 1
        ? design.entities.split(',') || ([] as string[])
        : [];

    const filtered = entities.filter((e) => e !== value);

    if (checked) {
      filtered.push(value);
    }

    setDesign(
      (current) =>
        current && {
          ...current,
          entities: filtered.join(','),
        }
    );
  };

  const handleDesignDismiss = () => {
    setSelectedDesign(null);

    if (data) {
      const blankDesign = prepareDesignForCreation(data, 'design');

      setDesign(
        (current) => current && { ...current, design: blankDesign.design }
      );
    }
  };

  return (
    <>
      <AdvancedSettingsPlanAlert />

      <PanelGroup>
        <Panel>
          <div className="space-y-4 h-full max-h-[80vh] overflow-y-auto">
            <Card
              title={
                type === 'template'
                  ? t('new_twig_template', {
                      defaultValue: 'New Twig Template',
                    })
                  : t('new_design')
              }
              className="shadow-sm pb-4"
              style={{ borderColor: colors.$24 }}
              headerStyle={{ borderColor: colors.$20 }}
            >
              <Element leftSide={t('name')}>
                <InputField
                  value={design?.name}
                  errorMessage={errors?.errors.name}
                  onValueChange={(value) => handleChange('name', value)}
                />
              </Element>

              {type === 'design' ? (
                <Element leftSide={t('design')}>
                  <DesignSelector
                    value={selectedDesign?.id}
                    onChange={setSelectedDesign}
                    onClearButtonClick={handleDesignDismiss}
                    actionVisibility={false}
                    errorMessage={
                      errors?.errors['design.header'] ||
                      errors?.errors['design.body'] ||
                      errors?.errors['design.footer'] ||
                      errors?.errors['design.includes']
                    }
                  />
                </Element>
              ) : null}

              {type === 'template' ? (
                <Element leftSide={t('resource')}>
                  {templateEntites.map((entity) => (
                    <Checkbox
                      key={entity}
                      label={t(entity)}
                      value={entity}
                      onValueChange={(value, checked) =>
                        handleResourceChange(value, Boolean(checked))
                      }
                      checked={design?.entities.includes(entity)}
                    />
                  ))}
                </Element>
              ) : null}
            </Card>

            {type === 'template' ? (
              <Card title={t('import')} withContainer>
                <Editor
                  height="400px"
                  defaultLanguage="html"
                  value={design?.design.body}
                  options={{
                    minimap: {
                      enabled: false,
                    },
                  }}
                  onChange={(value) =>
                    value !== undefined &&
                    setDesign(
                      (current) =>
                        current && {
                          ...current,
                          design: { ...current.design, body: value },
                        }
                    )
                  }
                />
              </Card>
            ) : null}
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel>
          <div className="max-h-[80vh] overflow-y-scroll">
            {canPreview ? (
              <InvoiceViewer
                link={endpoint('/api/v1/preview?html=false')}
                resource={previewPayload}
                method="POST"
              />
            ) : null}
          </div>
        </Panel>
      </PanelGroup>
    </>
  );
}
