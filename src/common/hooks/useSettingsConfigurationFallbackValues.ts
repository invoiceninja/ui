import { useCurrentCompany } from './useCurrentCompany';

export function useSettingsConfigurationFallbackValues() {
  const currentCompany = useCurrentCompany();

  return {
    currency_id: currentCompany?.settings.currency_id,
    language_id: currentCompany?.settings.language_id,
    timezone_id: currentCompany?.settings.timezone_id,
    date_format_id: currentCompany?.settings.date_format_id,
  };
}
