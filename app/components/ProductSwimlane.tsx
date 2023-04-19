import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {Heading, ProductCard, Section} from '~/components';

const mockProducts = new Array(12).fill('');

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}: {
  title?: string;
  products?: SerializeFrom<Product[]>;
  count?: number;
}) {
  return (
    <Section padding="none" {...props}>
      <Heading size="fine" className="min-w-[4rem]">
        You might also like
      </Heading>
      <div className="swimlane hiddenScroll px-0">
        {products.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start w-40"
          />
        ))}
      </div>
    </Section>
  );
}
