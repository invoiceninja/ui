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
import { StepItems } from '../components/StepItems';
import { WizardContext } from '../useWizard';

export default function Items() {
  const { wizard, money } = useOutletContext<WizardContext>();

  return <StepItems wizard={wizard} money={money} />;
}
