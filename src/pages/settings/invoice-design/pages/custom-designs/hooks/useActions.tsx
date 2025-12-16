import { Design } from '$app/common/interfaces/design';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { Action } from '$app/components/ResourceActions';
import { useTranslation } from 'react-i18next';
import { MdDownload } from 'react-icons/md';
import { useExportCustomDesign } from './useExportCustomDesign';

export function useActions() {
  const [t] = useTranslation();

  const exportCustomDesign = useExportCustomDesign();

  const actions: Action<Design>[] = [
    (customDesign) => (
      <DropdownElement
        onClick={() => exportCustomDesign(customDesign)}
        icon={<Icon element={MdDownload} />}
      >
        {t('export')}
      </DropdownElement>
    ),
  ];

  return actions;
}
