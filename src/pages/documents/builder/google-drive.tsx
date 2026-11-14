import type { ImportFromButtonProps } from '@docuninja/builder2.0';
import { useTranslation } from 'react-i18next';
import { isEmbedded } from '$app/common/helpers/embed';
import { Button } from '$app/components/forms';

export function ImportFromGoogleDrive({
  onClick,
  isSubmitting,
}: ImportFromButtonProps) {
  const [t] = useTranslation();

  // Google refuses its sign-in inside an app's web view, so the Drive
  // import cannot work embedded (`common/helpers/embed.ts`).
  if (isEmbedded()) {
    return null;
  }

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
