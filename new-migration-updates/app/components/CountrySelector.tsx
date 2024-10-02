import {Form, useLocation, useFetcher} from '@remix-run/react';
import {useEffect, useState} from 'react';
import type {Locale} from '~/data/countries';
import {useRootLoaderData} from '~/root';
import {loader} from '~/routes/($locale).api.countries';

export function CountrySelector() {
  const data = useRootLoaderData();
  const selectedLocale = data.selectedLocale;
  const {pathname, search} = useLocation();

  const [countries, setCountries] = useState<Record<string, Locale>>({});

  // Get available countries list
  const fetcher = useFetcher<typeof loader>();
  useEffect(() => {
    if (!fetcher.data) {
      fetcher.load('/api/countries');
      return;
    }
    setCountries(fetcher.data);
  }, [countries, fetcher.data]);

  const strippedPathname = pathname.replace(
    selectedLocale.pathPrefix || '',
    '',
  );

  return (
    <details>
      <summary>{selectedLocale.label}</summary>
      <div className="overflow-auto border-t py-2 bg-contrast w-full max-h-36">
        {countries &&
          Object.keys(countries).map((countryKey) => {
            const locale = countries[countryKey];
            const hreflang = `${locale.language}-${locale.country}`;

            return (
              <Form method="post" action="/locale" key={hreflang}>
                <input type="hidden" name="language" value={locale.language} />
                <input type="hidden" name="country" value={locale.country} />
                <input
                  type="hidden"
                  name="path"
                  value={`${strippedPathname}${search}`}
                />
                <button type="submit">{locale.label}</button>
              </Form>
            );
          })}
      </div>
    </details>
  );
}
