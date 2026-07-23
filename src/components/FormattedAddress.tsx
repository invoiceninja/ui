import { CSSProperties, Fragment } from 'react';
import { formatAddress } from 'localized-address-format';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { AddressFields } from '$app/common/interfaces/address';

interface Props {
  address: AddressFields;
  className?: string;
  style?: CSSProperties;
}

export function FormattedAddress(props: Props) {
  const resolveCountry = useResolveCountry();
  const country = resolveCountry(props.address.country_id);

  const addressLines = [
    ...formatAddress({
      addressLines: [props.address.address1, props.address.address2].filter(
        (line): line is string => Boolean(line)
      ),
      locality: props.address.city,
      administrativeArea: props.address.state,
      postalCode: props.address.postal_code,
      postalCountry: country?.iso_3166_2,
    }),
    country?.name,
  ].filter((line): line is string => Boolean(line));

  return (
    <span className={props.className} style={props.style}>
      {addressLines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </span>
  );
}
