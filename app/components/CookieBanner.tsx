import {useState} from 'react';
import {useFetcher} from '@remix-run/react';
import {USER_CONSENT_COOKIE, USER_CONSENT_COOKIE_NAME} from '~/lib/const';
import {getCookie} from '~/lib/utils';
import {Button, Link, Text} from '~/components';
import {useLocation} from 'react-use';

const CookieBanner = () => {
  const [hasUserConsent, setHasUserConsent] = useState(
    getCookie(USER_CONSENT_COOKIE_NAME),
  );

  const fetcher = useFetcher();
  const location = useLocation();

  return hasUserConsent === false ? (
    <div className="p-2 px-6 bg-black fixed bottom-0 z-50 w-full md:flex items-center justify-between">
      <div>
        <Text size="copy" className="text-white">
          We use cookies to give you the best user experience. By using our
          website you agree to our{' '}
          <Link className="underline" to={'/policies/privacy-policy'}>
            terms
          </Link>
        </Text>
      </div>
      <div className="text-center mt-4 md:mt-0">
        <Button
          onClick={() => {
            window.document.cookie = USER_CONSENT_COOKIE;
            fetcher.load(location.pathname ?? '/');
            setHasUserConsent(true);
          }}
        >
          ACCEPT
        </Button>
      </div>
    </div>
  ) : null;
};

export default CookieBanner;
