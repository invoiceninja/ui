/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';
import { useTranslation } from 'react-i18next';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceStatus as InvoiceStatusEnum } from '$app/common/enums/invoice-status';
import dayjs from 'dayjs';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { CSSProperties } from 'react';

interface Props {
  entity: Invoice;
  style?: CSSProperties;
  onClick?: () => void;
}

export function InvoiceStatus(props: Props) {
  const [t] = useTranslation();

  const { status_id, due_date, partial_due_date, partial, balance } =
    props.entity;

  const statusThemeColors = useStatusThemeColorScheme();

  const checkInvoiceInvitationsViewedDate = () => {
    return props.entity.invitations.some(
      (invitation) => invitation.viewed_date
    );
  };

  const isSent = status_id !== InvoiceStatusEnum.Draft;
  const isPaid = status_id === InvoiceStatusEnum.Paid;
  const isUnpaid = !isPaid;
  const isViewed = checkInvoiceInvitationsViewedDate();
  const isPartial = status_id === InvoiceStatusEnum.Partial;
  const isReversed = status_id === InvoiceStatusEnum.Reversed;
  const isCancelled = status_id === InvoiceStatusEnum.Cancelled;
  const isCancelledOrReversed = isCancelled || isReversed;
  const isDeleted = Boolean(props.entity.is_deleted);

  const isPastDue = () => {
    const date =
      partial !== 0 && partial_due_date ? partial_due_date : due_date;

    if (!date || balance === 0) {
      return false;
    }

    const isLessForOneDay =
      dayjs(date).diff(dayjs().format('YYYY-MM-DD'), 'day') <= -1;

    return !isDeleted && isSent && isUnpaid && isLessForOneDay;
  };

  if (isDeleted) {
    return (
      <Badge variant="red" onClick={props.onClick} style={props.style}>
        {t('deleted')}
      </Badge>
    );
  }

  if (props.entity.archived_at) {
    return (
      <Badge variant="orange" onClick={props.onClick} style={props.style}>
        {t('archived')}
      </Badge>
    );
  }

  if (isPastDue() && !isCancelledOrReversed) {
    return (
      <Badge
        variant="red"
        onClick={props.onClick}
        style={{ backgroundColor: statusThemeColors.$5, ...props.style }}
      >
        {t('past_due')}
      </Badge>
    );
  }

  if (isViewed && isUnpaid && !isPartial && !isCancelledOrReversed) {
    return (
      <Badge
        variant="yellow"
        onClick={props.onClick}
        style={{ backgroundColor: statusThemeColors.$4, ...props.style }}
      >
        {t('viewed')}
      </Badge>
    );
  }

  if (status_id === InvoiceStatusEnum.Draft) {
    return (
      <Badge variant="generic" onClick={props.onClick} style={props.style}>
        {t('draft')}
      </Badge>
    );
  }

  if (status_id === InvoiceStatusEnum.Sent) {
    return (
      <Badge
        variant="light-blue"
        style={{
          backgroundColor: statusThemeColors.$1,
          ...props.style,
        }}
        onClick={props.onClick}
      >
        {t('sent')}
      </Badge>
    );
  }

  if (status_id === InvoiceStatusEnum.Partial) {
    return (
      <Badge
        variant="dark-blue"
        onClick={props.onClick}
        style={{ backgroundColor: statusThemeColors.$2, ...props.style }}
      >
        {t('partial')}
      </Badge>
    );
  }

  if (status_id === InvoiceStatusEnum.Paid) {
    return (
      <Badge
        variant="green"
        onClick={props.onClick}
        style={{ backgroundColor: statusThemeColors.$3, ...props.style }}
      >
        {t('paid')}
      </Badge>
    );
  }

  if (status_id === InvoiceStatusEnum.Cancelled) {
    return (
      <Badge variant="black" onClick={props.onClick} style={props.style}>
        {t('cancelled')}
      </Badge>
    );
  }

  if (status_id === InvoiceStatusEnum.Reversed) {
    return (
      <Badge variant="purple" onClick={props.onClick} style={props.style}>
        {t('reversed')}
      </Badge>
    );
  }

  return (
    <Badge variant="purple" onClick={props.onClick} style={props.style}>
      {t('reversed')}
    </Badge>
  );
}
