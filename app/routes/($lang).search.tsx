import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Await, Form, useLoaderData, useSubmit} from '@remix-run/react';
import type {
  Collection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {ChangeEventHandler, Suspense, useRef, useState} from 'react';
import invariant from 'tiny-invariant';
import {Input, ProductGrid, Section, Text} from '~/components';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {PAGINATION_SIZE} from '~/lib/const';
import {useDebounce} from 'react-use';

export default function () {
  const {searchTerm, products, searchParams} = useLoaderData<typeof loader>();
  const noResults = products?.nodes?.length === 0;

  const submit = useSubmit();

  const [val, setVal] = useState(searchTerm);

  const formRef = useRef<HTMLFormElement>(null);

  useDebounce(() => submit(formRef.current, {replace: true}), 500, [val]);
  return (
    <>
      <div className="border border-bottom">
        <Form
          ref={formRef}
          method="GET"
          className="relative flex w-full text-heading"
        >
          <>
            <Input
              value={val}
              placeholder="Type to search..."
              type="search"
              variant="search"
              name="q"
              onChange={({currentTarget}: any) => {
                setVal(currentTarget.value);
              }}
            />
            {val && (
              <button
                className="absolute right-5 p-2 text-base"
                onClick={() => setVal('')}
              >
                &#10005;
              </button>
            )}
          </>
        </Form>
      </div>
      {noResults ? (
        <Section padding="x">
          <Text className="opacity-50">No results, try something else.</Text>
        </Section>
      ) : products ? (
        <Suspense>
          <Await
            errorElement="There was a problem loading related products"
            resolve={products}
          >
            {() => (
              <Section padding="s">
                <ProductGrid
                  key="search"
                  url={`/search?q=${searchTerm}`}
                  collection={{products} as Collection}
                />
              </Section>
            )}
          </Await>
        </Suspense>
      ) : null}
    </>
  );
}

export async function loader({request, context: {storefront}}: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const cursor = searchParams.get('cursor')!;
  const qParam = searchParams.get('q')!;
  const searchTerm = qParam ? qParam.replace(/\?.*/, '') : '';

  const data = await storefront.query<{
    products: ProductConnection;
  }>(SEARCH_QUERY, {
    variables: {
      pageBy: PAGINATION_SIZE,
      searchTerm,
      cursor,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');
  const {products} = data;

  return defer({
    searchTerm,
    searchParams,
    products,
  });
}

const SEARCH_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query search(
    $searchTerm: String
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      query: $searchTerm
      first: $pageBy
      after: $cursor
      sortKey: RELEVANCE
    ) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
