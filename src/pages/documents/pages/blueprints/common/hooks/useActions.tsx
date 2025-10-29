/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdCreate, MdSettings } from 'react-icons/md';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { GenericSingleResponse } from '$app/common/interfaces/docuninja/api';
import { AxiosResponse } from 'axios';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Document } from '$app/common/interfaces/docuninja/api';

interface UseActionsParams {
  onSettingsClick: (blueprint: Blueprint) => void;
}

export function useActions(params: UseActionsParams) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { onSettingsClick } = params;

  const extractSignatoryInfo = (blueprint: Blueprint) => {
    if (!blueprint.document?.files) {
      return { signatoryIds: [], signatoryInfo: {} };
    }

    const signatoryIds = new Set<string>();
    const signatoryInfo: Record<string, { id: string; color: string }> = {};

    // Track signatories and their colors in order
    const signatoryOrder: string[] = [];

    blueprint.document.files.forEach((file) => {
      if (file.metadata?.rectangles && Array.isArray(file.metadata.rectangles)) {
        file.metadata.rectangles.forEach((rectangle: any) => {
          if (rectangle.signatory_id && rectangle.signatory_id.startsWith('blueprint|')) {
            const signatoryId = rectangle.signatory_id;
            
            // Only add to signatoryOrder if we haven't seen this ID before
            if (!signatoryIds.has(signatoryId)) {
              signatoryIds.add(signatoryId);
              signatoryOrder.push(signatoryId);
            }
            
            // Store or update the color for this signatory
            signatoryInfo[signatoryId] = {
              id: signatoryId,
              color: rectangle.color || '#FF5733',
            };
          }
        });
      }
    });

    // Return signatories in the order they were encountered
    return {
      signatoryIds: signatoryOrder,
      signatoryInfo,
    };
  };

  const handleUseTemplate = (blueprint: Blueprint) => {
    const { signatoryIds, signatoryInfo } = extractSignatoryInfo(blueprint);

    if (signatoryIds.length > 0) {
      // Navigate to signatory mapping page
      navigate(route('/documents/templates/:id/map-signatories', { id: blueprint.id }), {
        state: { blueprint, signatoryIds, signatoryInfo },
      });
    } else {
      // No signatories to map, proceed directly
      request(
        'POST',
        docuNinjaEndpoint(`/api/blueprints/${blueprint.id}/action`),
        { action: 'make_document' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
          },
        }
      ).then((response: AxiosResponse<GenericSingleResponse<Document>>) =>
        navigate(route('/documents/:id/builder', { id: response.data.data.id }))
      );
    }
  };
  
  const actions: Action<Blueprint>[] = [
    (blueprint: Blueprint) => (
      Boolean(blueprint.is_template && !blueprint.is_deleted) && (
      <DropdownElement
        onClick={() => handleUseTemplate(blueprint)}
        icon={<Icon element={MdCreate} />}
      >
        {t('use_template')}
      </DropdownElement>
    )),
    (blueprint: Blueprint) => (
      <DropdownElement
        onClick={() => onSettingsClick(blueprint)}
        icon={<Icon element={MdSettings} />}
      >
        {t('settings')}
      </DropdownElement>
    ),
  ];

  return actions;
}
