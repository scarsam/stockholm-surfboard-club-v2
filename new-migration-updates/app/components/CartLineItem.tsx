import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 */
export function CartLineItem({
  layout,
  line,
}: {
  layout: CartLayout;
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li
      key={id}
      className="cart-line flex gap-4 border-b pb-4 border-[#e5e7eb] last:border-none"
    >
      {image && (
        <Image
          alt={title}
          aspectRatio="5/5"
          data={image}
          height={200}
          loading="lazy"
          width={200}
        />
      )}

      <div className="flex flex-col">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') {
              close();
            }
          }}
        >
          <p>
            <strong>{product.title}</strong>
          </p>
        </Link>
        <ul>
          {selectedOptions.map((option) => (
            <li key={option.name}>
              <small>
                {option.name}: {option.value}
              </small>
            </li>
          ))}
        </ul>
        <ProductPrice price={line?.cost?.totalAmount} />
        <CartLineQuantity line={line} />
      </div>
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="cart-line-quantity flex items-end flex-grow gap-2 mt-auto">
      <div className="flex flex-col justify-start grow">
        <small>Quantity:</small>
        <div className="flex items-center border border-black h-[26px] cart-update-form">
          <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
            <button
              className="transition hover:text-primary disabled:text-primary/10 flex-1"
              aria-label="Decrease quantity"
              disabled={quantity <= 1 || !!isOptimistic}
              name="decrease-quantity"
              value={prevQuantity}
            >
              <span>&#8722; </span>
            </button>
          </CartLineUpdateButton>

          <div
            className="px-2 text-center flex-1 border-x border-black"
            data-test="item-quantity"
          >
            {quantity}
          </div>

          <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
            <button
              className="transition hover:text-primary disabled:text-primary/10 flex-1"
              aria-label="Increase quantity"
              name="increase-quantity"
              value={nextQuantity}
              disabled={!!isOptimistic}
            >
              <span>&#43;</span>
            </button>
          </CartLineUpdateButton>
        </div>

        <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
      </div>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button className="mt-2 underline" disabled={disabled} type="submit">
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
