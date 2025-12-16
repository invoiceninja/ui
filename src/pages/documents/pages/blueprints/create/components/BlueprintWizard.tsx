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
import { Card } from '$app/components/cards';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InvoiceNinjaDesignStep } from './steps/InvoiceNinjaDesignStep';
import { CustomBlueprintStep } from './steps/CustomBlueprintStep';
import { TemplateSelectionStep } from './steps/TemplateSelectionStep';
import { Button } from '$app/components/forms';

export type WizardStep = 'selection' | 'invoice-ninja' | 'custom' | 'template';

export interface BlueprintWizardProps {
  onComplete: (blueprintId: string) => void;
  onCancel: () => void;
}

export function BlueprintWizard({ onComplete, onCancel }: BlueprintWizardProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [currentStep, setCurrentStep] = useState<WizardStep>('selection');

  const handleStepComplete = (blueprintId: string) => {
    onComplete(blueprintId);
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <SelectionStep
            onSelectInvoiceNinja={() => setCurrentStep('invoice-ninja')}
            onSelectCustom={() => setCurrentStep('custom')}
            onSelectTemplate={() => setCurrentStep('template')}
            onCancel={onCancel}
          />
        );
      case 'invoice-ninja':
        return (
          <InvoiceNinjaDesignStep
            onComplete={handleStepComplete}
            onBack={handleBackToSelection}
          />
        );
      case 'custom':
        return (
          <CustomBlueprintStep
            onComplete={handleStepComplete}
            onBack={handleBackToSelection}
          />
        );
      case 'template':
        return (
          <TemplateSelectionStep
            onComplete={handleStepComplete}
            onBack={handleBackToSelection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center">
      <Card
        title={t('create_template')}
        className="shadow-sm w-full xl:w-2/3"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        {renderStep()}
      </Card>
    </div>
  );
}

interface SelectionStepProps {
  onSelectInvoiceNinja: () => void;
  onSelectCustom: () => void;
  onSelectTemplate: () => void;
  onCancel: () => void;
}

function SelectionStep({
  onSelectInvoiceNinja,
  onSelectCustom,
  onSelectTemplate,
  onCancel,
}: SelectionStepProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const options = [
    {
      id: 'invoice-ninja',
      title: 'Invoice Ninja',
      description: t('invoice_ninja_template_description'),
      icon: '📄',
      onClick: onSelectInvoiceNinja,
    },
    {
      id: 'custom',
      title: t('create_your_own'),
      description: t('create_your_own_description'),
      icon: '🛠️',
      onClick: onSelectCustom,
    },
    {
      id: 'template',
      title: t('templates'),
      description: t('new_template_description'),
      icon: '📋',
      onClick: onSelectTemplate,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('choose_template_type')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {options.map((option) => (
          <button
            type="button"
            key={option.id}
            onClick={option.onClick}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
            style={{
              borderColor: colors.$20,
            }}
          >
            <div className="text-4xl mb-4">{option.icon}</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
              {option.title}
            </h3>
            <p className="text-gray-600 text-sm">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end p-6">
        <Button onClick={onCancel}>
          {t('back')}
        </Button>
      </div>
    </div>
  );
}
