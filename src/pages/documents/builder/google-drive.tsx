import type { ImportFromButtonProps } from '@docuninja/builder2.0';
import { useTranslation } from 'react-i18next';
import { Button } from '$app/components/forms';

export function ImportFromGoogleDrive({
  onClick,
  isSubmitting,
}: ImportFromButtonProps) {
  const [t] = useTranslation();

  return (
    <Button
      behavior="button"
      type="secondary"
      onClick={onClick}
      className="w-full"
    >
      {isSubmitting ? `${t('Importing')}...` : t('google_drive')}
    </Button>
  );
}
