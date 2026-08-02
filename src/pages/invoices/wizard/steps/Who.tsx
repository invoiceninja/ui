/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useOutletContext } from 'react-router-dom';
import { StepRecipient } from '../components/StepRecipient';
import { WizardContext } from '../useWizard';

export default function Who() {
  const { wizard } = useOutletContext<WizardContext>();

  return <StepRecipient wizard={wizard} />;
}
