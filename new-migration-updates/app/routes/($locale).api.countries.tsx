import {json} from '@remix-run/server-runtime';
import {CacheLong, generateCacheControlHeader} from '@shopify/hydrogen';
import {countries} from '~/data/countries';

export async function loader() {
  return json(
    {...countries},
    {headers: {'cache-control': generateCacheControlHeader(CacheLong())}},
  );
}

// no-op
export default function CountriesResourceRoute() {
  return null;
}
