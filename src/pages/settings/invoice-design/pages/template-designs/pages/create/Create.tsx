/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { Design } from '$app/common/interfaces/design';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useBlankDesignQuery } from '$app/common/queries/designs';
import { Container } from '$app/components/Container';
import { Card, Element } from '$app/components/cards';
import { Checkbox, InputField } from '$app/components/forms';
import { useSaveBtn } from '$app/components/layouts/common/hooks';
import Editor from '@monaco-editor/react';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export default function Create() {
  const { t } = useTranslation();
  const { data } = useBlankDesignQuery();

  const queryClient = useQueryClient();

  const baseTemplate =
    '<html>\n\t<head>\n\t</head>\n\t<body>\n\t\t<ninja>\n\n\t\t</ninja>\n\t</body>\n</html>\n';

  const [design, setDesign] = useState<Design | null>(null);
  const [errors, setErrors] = useState<ValidationBag | null>(null);

  const handleChange = <T extends keyof Design>(key: T, value: Design[T]) => {
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
                : baseTemplate,
            footer: ' ',
            includes: ' ',
          },
          [key]: value,
        }
    );
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

            queryClient.invalidateQueries(['/api/v1/designs']);

            navigate(
              route('/settings/invoice_design/template_designs/:id/edit', {
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
    },
    [design]
  );

  return (
    <Container>
      <Card title={t('new_proposal_template')}>
        <Element leftSide={t('name')}>
          <InputField
            value={design?.name}
            errorMessage={errors?.errors.name}
            onValueChange={(value) => handleChange('name', value)}
          />
        </Element>

        <Element leftSide={t('resource')}>
          <Checkbox
            label={t('invoice')}
            value="invoice"
            onValueChange={(value, checked) =>
              handleResourceChange(value, Boolean(checked))
            }
            checked={design?.entities.includes('invoice')}
          />

          <Checkbox
            label={t('payment')}
            value="payment"
            onValueChange={(value, checked) =>
              handleResourceChange(value, Boolean(checked))
            }
            checked={design?.entities.includes('payment')}
          />
        </Element>
      </Card>

      <Card title={t('import')} withContainer collapsed>
        <Editor
          height="20rem"
          defaultLanguage="html"
          value={design?.design.body}
          options={{
            minimap: {
              enabled: false,
            },
          }}
          onChange={(value) => value && setDesign(
            (c) => c && { ...c, design: { ...c.design, body: value } }
          )}
        />
      </Card>
    </Container>
  );
}
