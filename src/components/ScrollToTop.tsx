import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function ScrollToTop(props: any) {
  const location = useLocation();

  const pathSegments = location.pathname.split('/');
  const id = pathSegments?.[2] || '';

  const isClientShowPage =
    location.pathname.startsWith('/clients') &&
    id &&
    !location.pathname.endsWith('/edit');

  const isVendorShowPage =
    location.pathname.startsWith('/vendors') &&
    id &&
    !location.pathname.endsWith('/edit');

  useEffect(() => {
    if (isClientShowPage || isVendorShowPage) {
      return;
    }

    window.scrollTo(0, 0);
  }, [location]);

  return <>{props.children}</>;
}
