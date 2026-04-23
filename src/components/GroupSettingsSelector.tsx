import { useGroupSettingsQuery } from '$app/common/queries/group-settings';
import { SelectField } from './forms/SelectField';

interface Props {
  label?: string | null;
  value?: string;
  onValueChange?: (value: string) => void;
  errorMessage?: string | string[];
}

export function GroupSettingsSelector({
  label,
  value,
  onValueChange,
  errorMessage,
}: Props) {
  const { data: groupSettings } = useGroupSettingsQuery();

  if (!groupSettings) {
    return null;
  }

  return (
    <SelectField
      label={label}
      value={value}
      onValueChange={onValueChange}
      errorMessage={errorMessage}
      customSelector
      withBlank
    >
      {groupSettings.map((group, index: number) => (
        <option value={group.id} key={index}>
          {group.name}
        </option>
      ))}
    </SelectField>
  );
}
