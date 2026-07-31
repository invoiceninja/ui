/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode, useState } from 'react';
import { Edit3, FileText, Tool } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Card, CardContainer } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { AuthoredBlueprintStep } from './steps/AuthoredBlueprintStep';
import { CustomBlueprintStep } from './steps/CustomBlueprintStep';
import { InvoiceNinjaDesignStep } from './steps/InvoiceNinjaDesignStep';

export type WizardStep = 'selection' | 'invoice-ninja' | 'custom' | 'authored';

export interface BlueprintWizardProps {
  onComplete: (
    blueprintId: string,
    templateKind: 'invoice_design' | 'uploaded_pdf' | 'authored_document'
  ) => void;
  onCancel: () => void;
}

export function BlueprintWizard({
  onComplete,
  onCancel,
}: BlueprintWizardProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [currentStep, setCurrentStep] = useState<WizardStep>('selection');

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
            onSelectAuthored={() => setCurrentStep('authored')}
            onCancel={onCancel}
          />
        );
      case 'invoice-ninja':
        return (
          <InvoiceNinjaDesignStep
            onComplete={(id) => onComplete(id, 'invoice_design')}
            onBack={handleBackToSelection}
          />
        );
      case 'custom':
        return (
          <CustomBlueprintStep
            onComplete={(id) => onComplete(id, 'uploaded_pdf')}
            onBack={handleBackToSelection}
          />
        );
      case 'authored':
        return (
          <AuthoredBlueprintStep
            onComplete={(id) => onComplete(id, 'authored_document')}
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
  onSelectAuthored: () => void;
  onCancel: () => void;
}

function SelectionStep({
  onSelectInvoiceNinja,
  onSelectCustom,
  onSelectAuthored,
  onCancel,
}: SelectionStepProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const options: Array<{
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    onClick: () => void;
  }> = [
    {
      id: 'invoice-ninja',
      title: 'Invoice Ninja',
      description: t('invoice_ninja_template_description'),
      icon: <Icon element={FileText} size={32} />,
      onClick: onSelectInvoiceNinja,
    },
    {
      id: 'custom',
      title: t('create_your_own'),
      description: t('create_your_own_description'),
      icon: <Icon element={Tool} size={32} />,
      onClick: onSelectCustom,
    },
    {
      id: 'authored',
      title: 'Create document',
      description:
        'Compose a WYSIWYG document with flowing content and signing widgets.',
      icon: <Icon element={Edit3} size={32} />,
      onClick: onSelectAuthored,
    },
  ];

  return (
    <CardContainer>
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          {t('choose_template_type')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="mb-4">{option.icon}</div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
              {option.title}
            </h3>
            <p className="text-gray-600 text-sm">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onCancel}>{t('back')}</Button>
      </div>
    </CardContainer>
  );
}
