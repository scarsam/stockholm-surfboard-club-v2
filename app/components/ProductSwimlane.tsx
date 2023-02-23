import type {SerializeFrom} from '@shopify/remix-oxygen';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard, Section, Text} from '~/components';

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
    <Section padding="s" {...props}>
      <Text size="lead">{title}</Text>
      <div className="swimlane hiddenScroll md:pb-2 md:scroll-px-2 lg:scroll-px-2 md:px-2 lg:px-2">
        {products.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start w-80"
          />
        ))}
      </div>
    </Section>
  );
}
