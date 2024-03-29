import clsx from 'clsx';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import type {SerializeFrom} from '@shopify/remix-oxygen';
import {Text, Link, AddToCartButton} from '~/components';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  flexTitleAndPrice,
}: {
  product: SerializeFrom<Product>;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
  flexTitleAndPrice?: boolean;
}) {
  let cardLabel;

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];

  if (!firstVariant) return null;
  const {image, price, compareAtPrice} = firstVariant;

  const isOnSale = isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2);

  if (label) {
    cardLabel = label;
  } else if (isOnSale) {
    cardLabel = 'Sale';
  } else if (isNewArrival(product.publishedAt)) {
    cardLabel = 'New';
  } else if (product.isComingSoon) {
    cardLabel = 'Coming soon';
  } else if (!product.availableForSale) {
    cardLabel = 'Out of stock';
  }

  // const productAnalytics: ShopifyAnalyticsProduct = {
  //   productGid: product.id,
  //   variantGid: firstVariant.id,
  //   name: product.title,
  //   variantName: firstVariant.title,
  //   brand: product.vendor,
  //   price: firstVariant.price.amount,
  //   quantity: 1,
  // };

  const queryString = firstVariant.selectedOptions.reduce(
    (prev, option, index) => {
      if (option.value) {
        if (index > 0) prev += '&';
        prev += `${option.name}=${option.value}`;
      }
      return prev;
    },
    '',
  );

  return (
    <div className="flex flex-col">
      <Link
        onClick={onClick}
        to={`/products/${product.handle}?${queryString}`}
        prefetch="intent"
      >
        <div className={clsx(className)}>
          <div className="card-image aspect-[4/5] bg-primary/5">
            {image && (
              <Image
                className="w-full object-cover fadeIn"
                sizes="600px" // Todo: use a better size?
                aspectRatio="4/5"
                data={image}
                alt={image.altText || `Picture of ${product.title}`}
                loading={loading}
              />
            )}
            <Text
              as="label"
              size="fine"
              className="absolute top-0 right-0 m-4 text-right text-notice"
            >
              {cardLabel}
            </Text>
          </div>
          <div
            className={clsx(
              flexTitleAndPrice
                ? 'flex p-1 items-center justify-between'
                : 'grid py-1',
            )}
          >
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-ellipsis leading-4 text-sm md:text-copy"
              as="h3"
            >
              {product.title}
            </Text>
            {!product.isComingSoon && (
              <div className="flex gap-1">
                <Text className="flex gap-1 text-sm md:text-copy">
                  <Money
                    withoutTrailingZeros
                    data={price!}
                    className={clsx(isOnSale && 'text-red-500')}
                  />
                  {isOnSale && (
                    <CompareAtPrice
                      className={'opacity-50'}
                      data={compareAtPrice as MoneyV2}
                    />
                  )}
                </Text>
              </div>
            )}
          </div>
        </div>
      </Link>
      {/* {quickAdd && (
        <AddToCartButton
          lines={[
            {
              quantity: 1,
              merchandiseId: firstVariant.id,
            },
          ]}
          variant="secondary"
          className="mt-2"
          analytics={{
            products: [productAnalytics],
            totalValue: parseFloat(productAnalytics.price),
          }}
        >
          <Text as="span" className="flex items-center justify-center gap-2">
            Add to Bag
          </Text>
        </AddToCartButton>
      )} */}
    </div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);

  const styles = clsx('strike', className);

  return (
    <span className={styles}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
