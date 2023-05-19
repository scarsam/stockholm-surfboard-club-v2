import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {Heading, ProductCard, Section} from '~/components';

const mockProducts = new Array(12).fill('');

export function ProductSwimlane({
  products = mockProducts,
  ...props
}: {
  title?: string;
  products?: SerializeFrom<Product[]>;
  count?: number;
}) {
  return (
    <Section padding="none" {...props}>
      <Heading size="fine" className="min-w-[4rem] mx-4">
        You might also like
      </Heading>
      <div className="swimlane hiddenScroll px-0 mx-4 gap-4">
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
