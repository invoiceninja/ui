/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Document } from '$app/common/interfaces/docuninja/api';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { useBlueprintsQuery } from '$app/common/queries/docuninja/blueprints';
import { Button } from '$app/components/forms';
import { Element } from '$app/components/cards';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Blueprint } from '$app/common/interfaces/docuninja/blueprints';
import { endpoint } from '$app/common/helpers';

interface InvoiceNinjaDesignStepProps {
  onComplete: (blueprintId: string) => void;
  onBack: () => void;
}

const ENTITY_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'quote', label: 'Quote' },
  { value: 'credit', label: 'Credit' },
  { value: 'purchase_order', label: 'Purchase Order' },
];

export function InvoiceNinjaDesignStep({ onComplete, onBack }: InvoiceNinjaDesignStepProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');

  // Fetch existing blueprints
  const { data: blueprintsData, isLoading: isLoadingBlueprints } = useBlueprintsQuery({
    perPage: '100',
    currentPage: '1',
    status: ['active'],
  });

  // Create a map of existing entity types from blueprints
  const existingEntityTypes = useMemo(() => {
    if (!blueprintsData?.data?.data) return new Set<string>();
    
    return new Set(
      blueprintsData.data.data
        .map((blueprint: Blueprint) => blueprint.document?.metadata?.entity_type)
        .filter(Boolean)
    );
  }, [blueprintsData]);

  // Get available entity types (those not yet created)
  const availableEntityTypes = ENTITY_TYPES.filter(
    (entityType) => !existingEntityTypes.has(entityType.value)
  );

  const handleCreateBlueprint = async () => {
    if (!selectedEntityType || isLoading) return;

    setIsLoading(true);
    toast.processing();

    try {
      const response = await request(
        'POST',
        endpoint('/api/docuninja/stub_blueprint'),
        { entity: selectedEntityType }, { skipIntercept: true }
      ) as GenericSingleResourceResponse<Document>;

      toast.success('template_created');
      $refetch(['blueprints']);
      
      onComplete(response.data.data.id);
    } catch (error) {
      // console.error('Error creating blueprint:', error);
      toast.error('Error creating blueprint:');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingBlueprints) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">{t('loading')}...</div>
      </div>
    );
  }

  if (availableEntityTypes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">
          {t('all_entity_types_created')}
        </div>
        <Button onClick={onBack}>{t('back')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('document_type')}</h2>
        <p className="text-gray-600">{t('document_type_description')}</p>
      </div>

      <Element>
        <div className="space-y-4">
          {availableEntityTypes.map((entityType) => (
            <label
              key={entityType.value}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedEntityType === entityType.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: selectedEntityType === entityType.value 
                  ? colors.$3 
                  : colors.$20,
                backgroundColor: selectedEntityType === entityType.value 
                  ? colors.$3 + '10' 
                  : 'transparent',
              }}
            >
              <input
                type="radio"
                name="entityType"
                value={entityType.value}
                checked={selectedEntityType === entityType.value}
                onChange={(e) => setSelectedEntityType(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-semibold">{t(entityType.value)}</div>
                
              </div>
            </label>
          ))}
        </div>
      </Element>

      <div className="flex justify-between p-6">
        <Button onClick={onBack}>
          {t('back')}
        </Button>
        <Button
          onClick={handleCreateBlueprint}
          disabled={!selectedEntityType || isLoading}
        >
          {isLoading ? t('creating') : t('create_template')}
        </Button>
      </div>
    </div>
  );
}
