import { route } from '$app/common/helpers/route';
import { useCreditResolver } from '$app/common/hooks/credits/useCreditResolver';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { Credit } from '$app/common/interfaces/credit';
import { DynamicLink } from '$app/components/DynamicLink';
import { InputLabel } from '$app/components/forms';
import { Spinner } from '$app/components/Spinner';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  className?: string;
  creditId: string;
}

export function CreditLabel({ creditId, className }: Props) {
  const [t] = useTranslation();

  const disableNavigation = useDisableNavigation();

  const { find: findCredit } = useCreditResolver();

  const [currentCredit, setCurrentCredit] = useState<Credit>();

  useEffect(() => {
    if (creditId) {
      findCredit(creditId).then((credit) => setCurrentCredit(credit));
    }
  }, [creditId]);

  return (
    <div className={classNames('flex flex-col gap-y-3', className)}>
      <InputLabel>{t('credit')}</InputLabel>

      {currentCredit ? (
        <DynamicLink
          to={route('/credits/:id/edit', { id: creditId })}
          renderSpan={disableNavigation('credit', currentCredit)}
        >
          #{currentCredit.number}
        </DynamicLink>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
