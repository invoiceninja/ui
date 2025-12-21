import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Invoice } from '$app/common/interfaces/invoice';
import { Badge } from '$app/components/Badge';
import { TaxDataModal } from '$app/pages/clients/show/components/TaxDataModal';

interface Props {
  invoice: Invoice | undefined;
}

export function TaxDataBadge({ invoice }: Props) {
  const currentCompany = useCurrentCompany();

  if (
    !invoice ||
    currentCompany?.settings.country_id !== '840' ||
    !currentCompany?.calculate_taxes
  ) {
    return null;
  }

  return (
    <>
      {Object.entries(invoice.client?.tax_info || {}).length ? (
        <Badge variant="yellow">{invoice.client?.tax_info?.taxSales} %</Badge>
      ) : (
        <TaxDataModal
          resourceId={invoice.client?.id as string}
          resourceType="client"
          taxData={invoice.client?.tax_info}
          refetchInvoices
        />
      )}
    </>
  );
}
