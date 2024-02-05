import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {countries} from '~/data/countries';

export async function loader({context: {storefront}}: LoaderFunctionArgs) {
  return json(
    {
      ...countries,
    },
    {
      headers: {
        'cache-control': storefront.generateCacheControlHeader(
          storefront.CacheLong(),
        ),
      },
    },
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
