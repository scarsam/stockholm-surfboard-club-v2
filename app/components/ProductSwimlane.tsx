import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard, Section} from '~/components';

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
    <Section heading={title} padding="none" {...props}>
      <div className="swimlane hiddenScroll">
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
