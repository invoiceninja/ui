import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { SelectField } from './forms/SelectField';

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  errorMessage?: string | string[];
  label?: string | null;
}

export function IncomeAccountSelector({
  label,
  value,
  onValueChange,
  errorMessage,
}: Props) {
  const company = useCurrentCompany();

  return (
    <SelectField
      label={label}
      value={value}
      onValueChange={onValueChange}
      errorMessage={errorMessage}
      customSelector
      withBlank
    >
      {company?.quickbooks?.settings?.income_account_map &&
        company.quickbooks.settings.income_account_map.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
    </SelectField>
  );
}
