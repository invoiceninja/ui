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
import { StepTiming } from '../components/StepTiming';
import { WizardContext } from '../useWizard';

export default function Payment() {
  const { wizard } = useOutletContext<WizardContext>();

  return <StepTiming wizard={wizard} />;
}
