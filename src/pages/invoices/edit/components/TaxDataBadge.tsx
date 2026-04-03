import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Badge } from '$app/components/Badge';
import { TaxDataModal } from '$app/pages/clients/show/components/TaxDataModal';

interface Props {
  resource: Invoice | RecurringInvoice | Quote | undefined;
}

export function TaxDataBadge({ resource }: Props) {
  const currentCompany = useCurrentCompany();

  if (
    !resource ||
    currentCompany?.settings.country_id !== '840' ||
    !currentCompany?.calculate_taxes
  ) {
    return null;
  }

  return (
    <>
      {Object.entries(resource.client?.tax_info || {}).length ? (
        <Badge variant="yellow">
          {(resource.client?.tax_info?.taxSales || 0) * 100} %
        </Badge>
      ) : (
        <TaxDataModal
          resourceId={resource.client?.id as string}
          resourceType="client"
          taxData={resource.client?.tax_info}
          refetchInvoices
        />
      )}
    </>
  );
}
