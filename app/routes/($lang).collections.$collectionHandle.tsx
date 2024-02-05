import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import type {
  Collection as CollectionType,
  CollectionConnection,
  Product,
  ProductVariant,
  MoneyV2,
} from '@shopify/hydrogen/storefront-api-types';
import {
  flattenConnection,
  AnalyticsPageType,
  type SeoHandleFunction,
} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import {Section} from '~/components';
import {ProductGrid} from '~/components/ProductGrid';
import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {isDiscounted} from '~/lib/utils';

const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.collection?.seo?.title,
  description: data?.collection?.seo?.description,
  titleTemplate: '%s',
  media: {
    type: 'image',
    url: data?.collection?.image?.url,
    height: data?.collection?.image?.height,
    width: data?.collection?.image?.width,
    altText: data?.collection?.image?.altText,
  },
});

export const handle = {
  seo,
};

const PAGINATION_SIZE = 48;

type VariantFilterParam = Record<string, string | boolean>;
type PriceFiltersQueryParam = Record<'price', {max?: number; min?: number}>;
type VariantOptionFiltersQueryParam = Record<
  'variantOption',
  {name: string; value: string}
>;

export type AppliedFilter = {
  label: string;
  urlParam: {
    key: string;
    value: string;
  };
};

type FiltersQueryParams = Array<
  VariantFilterParam | PriceFiltersQueryParam | VariantOptionFiltersQueryParam
>;

export type SortParam =
  | 'price-low-high'
  | 'price-high-low'
  | 'best-selling'
  | 'newest'
  | 'featured';

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {collectionHandle} = params;

  invariant(collectionHandle, 'Missing collectionHandle param');

  const searchParams = new URL(request.url).searchParams;
  const knownFilters = ['productVendor', 'productType'];
  const available = 'available';
  const variantOption = 'variantOption';
  const {sortKey, reverse} = getSortValuesFromParam(
    searchParams.get('sort') as SortParam,
  );
  const cursor = searchParams.get('cursor');
  const filters: FiltersQueryParams = [];
  const appliedFilters: AppliedFilter[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (available === key) {
      filters.push({available: value === 'true'});
      appliedFilters.push({
        label: value === 'true' ? 'In stock' : 'Out of stock',
        urlParam: {
          key: available,
          value,
        },
      });
    } else if (knownFilters.includes(key)) {
      filters.push({[key]: value});
      appliedFilters.push({label: value, urlParam: {key, value}});
    } else if (key.includes(variantOption)) {
      const [name, val] = value.split(':');
      filters.push({variantOption: {name, value: val}});
      appliedFilters.push({label: val, urlParam: {key, value}});
    }
  }

  // Builds min and max price filter since we can't stack them separately into
  // the filters array. See price filters limitations:
  // https://shopify.dev/custom-storefronts/products-collections/filter-products#limitations
  if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
    const price: {min?: number; max?: number} = {};
    if (searchParams.has('minPrice')) {
      price.min = Number(searchParams.get('minPrice')) || 0;
      appliedFilters.push({
        label: `Min: $${price.min}`,
        urlParam: {key: 'minPrice', value: searchParams.get('minPrice')!},
      });
    }
    if (searchParams.has('maxPrice')) {
      price.max = Number(searchParams.get('maxPrice')) || 0;
      appliedFilters.push({
        label: `Max: $${price.max}`,
        urlParam: {key: 'maxPrice', value: searchParams.get('maxPrice')!},
      });
    }
    filters.push({
      price,
    });
  }

  const {collection, collections} = await context.storefront.query<{
    collection: CollectionType;
    collections: CollectionConnection;
  }>(COLLECTION_QUERY, {
    variables: {
      handle: collectionHandle,
      pageBy: PAGINATION_SIZE,
      cursor,
      filters,
      sortKey,
      reverse,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!collection) {
    throw new Response(null, {status: 404});
  }

  const collectionWithAllProductVariants = () => {
    const products = collection.products.nodes;
    const newProducts: Product[] = [];
    const onlyDiscountedVariants = collection.handle === 'sale';

    products.forEach((product) => {
      let variants = product.variants.nodes;
      const usedColors: string[] = [];

      if (onlyDiscountedVariants) {
        variants = variants.filter((v) =>
          isDiscounted(v.price as MoneyV2, v.compareAtPrice as MoneyV2),
        );
      }

      const hasColorOption = product.variants.nodes[0]?.selectedOptions.some(
        (option) => option.name === 'Color',
      );

      if (!hasColorOption && variants.length > 0) {
        newProducts.push({
          ...product,
          isComingSoon: !!product.comingSoon?.value,
        });
      } else {
        variants.forEach((variant) => {
          const colorOptionValue = variant.selectedOptions.find(
            (option) => option.name === 'Color',
          )?.value;

          if (
            colorOptionValue &&
            !usedColors.some((color) => color === colorOptionValue)
          ) {
            newProducts.push({
              ...product,
              //@ts-ignore
              variants: {...variants, nodes: [variant]},
              isComingSoon: !!product.comingSoon?.value,
            });
            if (colorOptionValue) {
              usedColors.push(colorOptionValue);
            }
          }
        });
      }
    });

    return {
      ...collection,
      products: {...collection.products, nodes: newProducts},
    };
  };

  const collectionNodes = flattenConnection(collections);
  const collectionNode = collectionWithAllProductVariants();

  return json({
    collection: collectionNode,
    appliedFilters,
    collections: collectionNodes,
    analytics: {
      pageType: AnalyticsPageType.collection,
      collectionHandle,
      resourceId: collection.id,
    },
  });
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();

  return (
    <>
      {/* <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
              <Text format width="narrow" as="p" className="inline-block">
                {collection.description}
              </Text>
            </div>
          </div>
        )}
      </PageHeader> */}
      <Section padding="none" className="p-1 md:p-4">
        {/* <SortFilter
          filters={collection.products.filters as Filter[]}
          appliedFilters={appliedFilters}
          collections={collections as CollectionType[]}
        > */}
        <ProductGrid
          key={collection.id}
          collection={collection as CollectionType}
          url={`/collections/${collection.handle}`}
          data-test="product-grid"
        />
        {/* </SortFilter> */}
      </Section>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(
        first: $pageBy,
        after: $cursor,
        filters: $filters,
        sortKey: $sortKey,
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
    collections(first: 100) {
      edges {
        node {
          title
          handle
        }
      }
    }
  }
`;

function getSortValuesFromParam(sortParam: SortParam | null) {
  switch (sortParam) {
    case 'price-high-low':
      return {
        sortKey: 'PRICE',
        reverse: true,
      };
    case 'price-low-high':
      return {
        sortKey: 'PRICE',
        reverse: false,
      };
    case 'best-selling':
      return {
        sortKey: 'BEST_SELLING',
        reverse: false,
      };
    case 'newest':
      return {
        sortKey: 'CREATED',
        reverse: true,
      };
    case 'featured':
      return {
        sortKey: 'MANUAL',
        reverse: false,
      };
    default:
      return {
        sortKey: 'RELEVANCE',
        reverse: false,
      };
  }
}
