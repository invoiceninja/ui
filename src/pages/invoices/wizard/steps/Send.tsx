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
import { StepReview } from '../common/components/StepReview';
import { WizardContext } from '../common/hooks/useWizard';

export default function Send() {
  const { wizard } = useOutletContext<WizardContext>();

  return <StepReview wizard={wizard} />;
}
