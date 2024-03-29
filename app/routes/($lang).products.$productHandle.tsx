import {
  type ReactNode,
  Suspense,
  useMemo,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  useLoaderData,
  Await,
  useSearchParams,
  useLocation,
  useNavigation,
} from '@remix-run/react';
import {
  AnalyticsPageType,
  Money,
  ShopifyAnalyticsProduct,
  flattenConnection,
  Image,
  type SeoHandleFunction,
  type SeoConfig,
} from '@shopify/hydrogen';
import {
  Heading,
  ProductGallery,
  ProductSwimlane,
  Section,
  Skeleton,
  Text,
  Link,
  AddToCartButton,
  Button,
} from '~/components';
import invariant from 'tiny-invariant';
import clsx from 'clsx';
import type {
  ProductVariant,
  SelectedOptionInput,
  Product as ProductType,
  Shop,
  ProductConnection,
  MediaConnection,
  MediaImage,
  SelectedOption,
  Metaobject,
  MoneyV2,
} from '@shopify/hydrogen/storefront-api-types';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import type {Storefront} from '~/lib/type';
import type {Product} from 'schema-dts';
import {isDiscounted, parseSizeGuide} from '~/lib/utils';
import {useModal} from '~/components/Modals/useModal';
import {useStore} from '~/store';

const seo: SeoHandleFunction<typeof loader> = ({data}) => {
  const media = flattenConnection<MediaConnection>(data.product.media).find(
    (media) => media.mediaContentType === 'IMAGE',
  ) as MediaImage | undefined;

  return {
    title: data?.product?.seo?.title ?? data?.product?.title,
    media: media?.image,
    description: data?.product?.seo?.description ?? data?.product?.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      brand: data?.product?.vendor,
      name: data?.product?.title,
    },
  } satisfies SeoConfig<Product>;
};

export const handle = {
  seo,
};

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param, check route filename');

  const searchParams = new URL(request.url).searchParams;

  const selectedOptions: SelectedOptionInput[] = [];
  searchParams.forEach((value, name) => {
    selectedOptions.push({name, value});
  });

  const {shop, product} = await context.storefront.query<{
    product: ProductType & {selectedVariant?: ProductVariant};
    shop: Shop;
  }>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const metaObjectReference = product.sizeGuide?.reference as Metaobject;
  const sizeGuide = metaObjectReference?.field?.value;

  if (sizeGuide) {
    product.parsedSizeGuide = parseSizeGuide(sizeGuide);
  }

  product.isComingSoon = !!product.comingSoon?.value;

  const recommended = getRecommendedProducts(context.storefront, product.id);
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant.id,
    name: product.title,
    variantName: selectedVariant.title,
    brand: product.vendor,
    price: selectedVariant.price.amount,
  };

  return defer({
    product,
    shop,
    recommended,
    analytics: {
      pageType: AnalyticsPageType.product,
      resourceId: product.id,
      products: [productAnalytics],
      totalValue: parseFloat(selectedVariant.price.amount),
    },
  });
}

export default function ProductComponent() {
  const location = useLocation();
  const {product, recommended} = useLoaderData<typeof loader>();
  const {Modal, setModal} = useModal();

  const {setIsSizeSelected} = useStore();

  useEffect(() => {
    return () => setIsSizeSelected(false);
  }, [location.pathname, setIsSizeSelected]);

  const {media, title, descriptionHtml} = product as ProductType;
  const firstVariant = product.variants.nodes[0];
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isComingSoon = product.isComingSoon;

  const isOnSale = isDiscounted(
    selectedVariant.price as MoneyV2,
    selectedVariant.compareAtPrice as MoneyV2,
  );

  const galleryMedia = useMemo(
    () =>
      media.nodes.reduce((mediaNodesArray, mediaNode) => {
        if (
          !selectedVariant.image?.altText ||
          mediaNode.alt === selectedVariant.image?.altText
        ) {
          mediaNodesArray.push(mediaNode);
        }
        return mediaNodesArray;
      }, [] as any[]),
    [media.nodes, selectedVariant.image?.altText],
  );

  return (
    <>
      <Modal />
      <Section padding="none">
        <div className="grid items-start md:grid-cols-2 lg:grid-cols-3">
          <ProductGallery
            media={galleryMedia}
            className="w-screen md:w-full lg:col-span-2 gap-0 md:gap-4 px-0"
          />
          <div className="sticky md:-mb-nav md:top-nav md:-translate-y-nav md:h-screen md:pt-nav hiddenScroll md:overflow-y-scroll">
            <section className="flex flex-col w-full gap-4 md:px-0">
              <div className="border-b pb-3 pt-0 md:py-3">
                <div className="mx-4 grid md:flex justify-between grid-flow-col">
                  <Heading as="h1" size="copy" className="whitespace-normal">
                    {title}
                  </Heading>
                  {!isComingSoon && (
                    <Text as="span" className="flex items-center gap-2">
                      <Money
                        withoutTrailingZeros
                        data={selectedVariant?.price!}
                        as="span"
                        className={clsx(isOnSale && 'text-red-500')}
                      />
                      {isOnSale && (
                        <Money
                          withoutTrailingZeros
                          data={selectedVariant?.compareAtPrice!}
                          as="span"
                          className="opacity-50 strike"
                        />
                      )}
                    </Text>
                  )}
                </div>
              </div>
              <ProductForm
                prouctDescription={descriptionHtml}
                setModal={setModal}
              />
              <div className="grid gap-2">
                <Suspense fallback={<Skeleton className="h-32" />}>
                  <Await
                    errorElement="There was a problem loading related products"
                    resolve={recommended}
                  >
                    {(products) => (
                      <ProductSwimlane
                        title="You might also like"
                        products={products}
                      />
                    )}
                  </Await>
                </Suspense>
              </div>
            </section>
          </div>
        </div>
      </Section>
    </>
  );
}

type ProductFormProps = {
  prouctDescription: string;
  setModal: Dispatch<
    SetStateAction<
      {name: 'location' | 'newsletter' | 'sizeGuide'; data?: any} | undefined
    >
  >;
};

export function ProductForm({prouctDescription, setModal}: ProductFormProps) {
  const {product, analytics} = useLoaderData<typeof loader>();
  const {isSizeSelected: isSelected} = useStore();
  const [currentSearchParams] = useSearchParams();
  const transition = useNavigation();

  /**
   * We update `searchParams` with in-flight request data from `transition` (if available)
   * to create an optimistic UI, e.g. check the product option before the
   * request has completed.
   */
  const searchParams = useMemo(() => {
    return transition.location
      ? new URLSearchParams(transition.location.search)
      : currentSearchParams;
  }, [currentSearchParams, transition]);

  // Removng the size option since we never want this pre selected
  const firstVariant = product.variants.nodes[0];

  const isSizeSelected =
    isSelected ||
    !(
      product.options.find((option: SelectedOption) => option.name === 'Size')
        ?.values?.length > 1
    );

  /**
   * We're making an explicit choice here to display the product options
   * UI with a default variant, rather than wait for the user to select
   * options first. Developers are welcome to opt-out of this behavior.
   * By default, the first variant's options are used.
   */
  const searchParamsWithDefaults = useMemo<URLSearchParams>(() => {
    const clonedParams = new URLSearchParams(searchParams);

    for (const {name, value} of firstVariant.selectedOptions) {
      if (!searchParams.has(name)) {
        clonedParams.set(name, value);
      }
    }

    return clonedParams;
  }, [searchParams, firstVariant.selectedOptions]);

  /**
   * Likewise, we're defaulting to the first variant for purposes
   * of add to cart if there is none returned from the loader.
   * A developer can opt out of this, too.
   */
  const selectedVariant = product.selectedVariant ?? firstVariant;
  const isOutOfStock = !selectedVariant?.availableForSale;

  const productAnalytics: ShopifyAnalyticsProduct = {
    ...analytics.products[0],
    quantity: 1,
  };

  const sizeGuide = product.parsedSizeGuide;
  const isComingSoon = product.isComingSoon;

  return (
    <div className="grid pb-4 border-b">
      <div className="grid gap-4">
        {prouctDescription && (
          <div className="grid gap-2 border-b pb-4">
            <div className="mx-4">
              <Heading size="fine" className="min-w-[4rem]">
                Description
              </Heading>
              <div dangerouslySetInnerHTML={{__html: prouctDescription}} />
              {sizeGuide && (
                <div className="pt-4">
                  <Button
                    as="span"
                    className="text-fine subpixel-antialiased underline underline-offset-4 cursor-pointer"
                    variant="inline"
                    onClick={() =>
                      setModal({name: 'sizeGuide', data: sizeGuide})
                    }
                  >
                    Size Guide
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        {!isComingSoon && (
          <ProductOptions
            product={product}
            searchParamsWithDefaults={searchParamsWithDefaults}
          />
        )}
        {selectedVariant && (
          <div className="grid items-stretch gap-2 mx-4">
            <AddToCartButton
              lines={[
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                },
              ]}
              variant={isOutOfStock || !isSizeSelected ? 'outline' : 'primary'}
              className={
                isOutOfStock || !isSizeSelected ? 'secondary' : 'primary'
              }
              data-test="add-to-cart"
              analytics={{
                products: [productAnalytics],
                totalValue: parseFloat(productAnalytics.price),
              }}
              disabled={isOutOfStock || !isSizeSelected}
            >
              <Text
                as="span"
                width="wide"
                className="flex items-center justify-center gap-2 m-auto"
              >
                {isComingSoon
                  ? 'Coming soon'
                  : !isSizeSelected
                  ? 'Select Size'
                  : isOutOfStock
                  ? 'Out of stock'
                  : 'ADD TO CART'}
              </Text>
            </AddToCartButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductOptions({
  product,
  searchParamsWithDefaults,
}: {
  product: ProductType;
  searchParamsWithDefaults: URLSearchParams;
}) {
  const options = product.options;
  //@ts-ignore
  const allVariants = product.allVariants.nodes as ProductVariant[];
  const {isSizeSelected} = useStore();

  return (
    <>
      {[...options]
        .reverse()
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div key={option.name} className="border-b pb-4">
            <div className="flex flex-col flex-wrap mx-4">
              <Heading as="legend" size="fine" className="min-w-[4rem] pb-2">
                {option.name}
              </Heading>
              <div className="flex flex-wrap items-baseline">
                {option.values.map((value) => {
                  const isColorOption = option.name === 'Color';
                  const isSizeOption = option.name === 'Size';

                  let checked =
                    searchParamsWithDefaults.get(option.name) === value;

                  if (isSizeOption && !isSizeSelected && checked) {
                    checked = false;
                  }

                  const id = `option-${option.name}-${value}`;
                  const image = product.media?.nodes?.find(
                    (image) => image.alt === value,
                  );

                  let availableForSale = true;
                  let size, color;

                  if (isSizeOption) {
                    color = searchParamsWithDefaults.get('Color');
                  } else if (isColorOption) {
                    size = searchParamsWithDefaults.get('Size');
                  }
                  const compareOptions = [
                    ...(searchParamsWithDefaults.has('Size')
                      ? [{name: 'Size', value: size ?? value}]
                      : []),
                    ...(searchParamsWithDefaults.has('Color')
                      ? [{name: 'Color', value: color ?? value}]
                      : []),
                  ];

                  const variant = allVariants.find(
                    ({selectedOptions}) =>
                      JSON.stringify(selectedOptions) ===
                      JSON.stringify(compareOptions),
                  );

                  if (variant) {
                    availableForSale = variant.availableForSale;
                  }

                  return (
                    <Text key={id}>
                      {!isColorOption || !image ? (
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          className={clsx(
                            'leading-none cursor-pointer transition-all duration-200',
                            'px-3 py-3 md:px-4 xl:px-5 mt-1 mr-1 flex justify-center border',
                            checked && availableForSale
                              ? 'bg-black text-white'
                              : checked && !availableForSale
                              ? 'bg-gray-100 text-gray-400'
                              : '',
                            !availableForSale && !isColorOption
                              ? 'pointer-events-none border text-gray-400'
                              : 'border-black',
                          )}
                        />
                      ) : (
                        <ProductOptionLink
                          optionName={option.name}
                          optionValue={value}
                          searchParams={searchParamsWithDefaults}
                          className={clsx(
                            'leading-none cursor-pointer transition-all duration-200',
                            'mt-1 mr-1 flex justify-center border',
                            checked ? 'border-black' : 'border-white',
                            !availableForSale && !isColorOption
                              ? 'pointer-events-none opacity-20'
                              : '',
                          )}
                        >
                          {image?.previewImage && (
                            <Image
                              data={image.previewImage}
                              alt={image.alt!}
                              className="w-full mx-auto min-w-[50px] max-w-[60px]"
                              sizes="4vw"
                              aspectRatio="4/5"
                            />
                          )}
                        </ProductOptionLink>
                      )}
                    </Text>
                  );
                })}
                {/* </>
                )} */}
              </div>
            </div>
          </div>
        ))}
    </>
  );
}

function ProductOptionLink({
  optionName,
  optionValue,
  searchParams,
  children,
  ...props
}: {
  optionName: string;
  optionValue: string;
  searchParams: URLSearchParams;
  children?: ReactNode;
  [key: string]: any;
}) {
  const {pathname} = useLocation();
  const isLangPathname = /\/[a-zA-Z]{2}-[a-zA-Z]{2}\//g.test(pathname);
  // fixes internalized pathname
  const path = isLangPathname
    ? `/${pathname.split('/').slice(2).join('/')}`
    : pathname;

  const clonedSearchParams = new URLSearchParams(searchParams);
  clonedSearchParams.set(optionName, optionValue);

  const {isSizeSelected, setIsSizeSelected} = useStore();

  return (
    <Link
      {...props}
      onClick={() =>
        optionName === 'Size' && !isSizeSelected ? setIsSizeSelected(true) : {}
      }
      preventScrollReset
      prefetch="intent"
      replace
      to={`${path}?${clonedSearchParams.toString()}`}
    >
      {children ?? optionValue}
    </Link>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariantFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
    image {
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
  }
`;

const PRODUCT_VARIANT_TEST_FRAGMENT = `#graphql
  fragment ProductVariantTestFragment on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  ${MEDIA_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${PRODUCT_VARIANT_TEST_FRAGMENT}
  query Product(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      comingSoon: metafield(namespace: "custom", key: "coming_soon") {
        value
      }
      sizeGuide: metafield(namespace: "custom", key: "size_guide") {
        reference {
        ... on Metaobject {
          field(key: "text") {
            value
          }
        }
      }
      }
      description
      options {
        name
        values
      }
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        ...ProductVariantFragment
      }
      allVariants: variants(first: 250) {
        nodes {
          ...ProductVariantTestFragment
        }
      }
      media(first: 20) {
        nodes {
          ...Media
        }
      }
      variants(first: 1) {
        nodes {
          ...ProductVariantFragment
        }
      }
      seo {
        description
        title
      }
    }
    shop {
      name
      shippingPolicy {
        body
        handle
      }
      refundPolicy {
        body
        handle
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query productRecommendations(
    $productId: ID!
    $count: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    recommended: productRecommendations(productId: $productId) {
      ...ProductCard
    }
    additional: products(first: $count, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

async function getRecommendedProducts(
  storefront: Storefront,
  productId: string,
) {
  const products = await storefront.query<{
    recommended: ProductType[];
    additional: ProductConnection;
  }>(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {productId, count: 12},
  });

  invariant(products, 'No data returned from Shopify API');

  const mergedProducts = products.recommended
    .concat(products.additional.nodes)
    .filter(
      (value, index, array) =>
        array.findIndex((value2) => value2.id === value.id) === index,
    );

  const originalProduct = mergedProducts
    .map((item: ProductType) => item.id)
    .indexOf(productId);

  mergedProducts.splice(originalProduct, 1);

  return mergedProducts;
}
