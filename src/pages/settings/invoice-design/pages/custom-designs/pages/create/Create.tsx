/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
import { useBlankDesignQuery } from '$app/common/queries/designs';
import { Container } from '$app/components/Container';
import { Card, Element } from '$app/components/cards';
import { Checkbox, InputField, Radio } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CustomDesignsPlanAlert } from '../../components/CustomDesignsPlanAlert';
import { Editor } from '@monaco-editor/react';

export const templateEntites = [
  'invoice',
  'payment',
  'client',
  'quote',
  'credit',
  'purchase_order',
  'project',
  'task',
];

export default function Create() {
  const { t } = useTranslation();
  const { data } = useBlankDesignQuery();

  const [design, setDesign] = useState<Design | null>(null);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const handleChange = <T extends keyof Design>(key: T, value: Design[T]) => {
    setDesign((current) => current && { ...current, [key]: value });
  };

  useEffect(() => {
    if (data) {
      setDesign(data);
    }

    return () => setDesign(null);
  }, [data]);

  const navigate = useNavigate();

  useSaveBtn(
    {
      onClick() {
        toast.processing();
        setErrors(null);

        request('POST', endpoint('/api/v1/designs'), design)
          .then((response: GenericSingleResourceResponse<Design>) => {
            toast.success('design_created');

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
          });
      },
      disableSaveButton: !proPlan() && !enterprisePlan(),
    },
    [design]
  );

  const [type, setType] = useState<'design' | 'template'>('design');

  const handleTypeChange = (t: typeof type) => {
    if (t === 'template') {
      setDesign(
        (current) =>
          current && {
            ...current,
            is_template: true,
            design: {
              ...current.design,
              header: ' ',
              body:
                current.design.body.length > 0
                  ? current.design.body
                  : '<html>\n\t<head>\n\t</head>\n\t<body>\n\t\t<ninja>\n\n\t\t</ninja>\n\t</body>\n</html>\n',
              footer: ' ',
              includes: ' ',
            },
          }
      );

      return;
    }

    if (t === 'design') {
      setDesign(
        (current) =>
          current && {
            ...current,
            is_template: false,
            design: {
              ...current.design,
              header: '',
              body: '',
              footer: '',
              includes: '',
            },
            entities: '',
          }
      );

      return;
    }
  };

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

  return (
    <Container>
      <CustomDesignsPlanAlert />

      <Card title={t('new_design')}>
        <Element leftSide={t('name')}>
          <InputField
            value={design?.name}
            errorMessage={errors?.errors.name}
            onValueChange={(value) => handleChange('name', value)}
          />
        </Element>

        <Element leftSide={t('type')}>
          <Radio
            name="type"
            options={[
              {
                id: 'design',
                title: t('design'),
                value: 'design',
              },
              { id: 'template', title: t('template'), value: 'template' },
            ]}
            defaultSelected={type}
            onValueChange={(v) => {
              setType(v as 'design' | 'template');
              handleTypeChange(v as 'design' | 'template');
            }}
          />
        </Element>

        {type === 'design' ? (
          <Element leftSide={t('design')}>
            <DesignSelector
              onChange={(design) => handleChange('design', design.design)}
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
        <Card title={t('import')} withContainer collapsed>
          <Editor
            height="15rem"
            defaultLanguage="html"
            value={design?.design.body}
            options={{
              minimap: {
                enabled: false,
              },
            }}
            onChange={(value) =>
              value &&
              setDesign(
                (c) => c && { ...c, design: { ...c.design, body: value } }
              )
            }
          />
        </Card>
      ) : null}
    </Container>
  );
}
