/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useHandleCustomFieldChange } from '$app/common/hooks/useHandleCustomFieldChange';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { CustomFieldsPlanAlert } from '$app/components/CustomFieldsPlanAlert';
import { Field } from '$app/pages/settings/custom-fields/components';
import { useTranslation } from 'react-i18next';
import { Link } from '$app/components/forms';

export default function PaymentFields() {
  const [t] = useTranslation();

  const company = useInjectCompanyChanges();

  const handleCustomFieldChange = useHandleCustomFieldChange();

  return (
    <Card title={t('custom_fields')} withContainer>
      <div>
        <span className="text-sm">
          {t('custom_fields_location_changed')} &nbsp;
        </span>
        <Link to="/settings/custom_fields/payments" className="capitalize">
          {t('click_here')}
        </Link>
      </div>
    </Card>
  );
}
