import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity! > 0;
  const {close} = useAside();

  return (
    <div className={className}>
      <div className="flex justify-between p-[calc(0.5em-1px)] md:p-[calc(0.5em-0.5px)] border-b border-t w-full border-[#e5e7eb]">
        <strong>Bag: {cart?.totalQuantity || 0}</strong>
        <button onClick={close} className="focus:ring-0">
          Close
        </button>
      </div>
      <div className="h-full px-2 pb-2">
        <CartEmpty hidden={linesCount} layout={layout} />
        <div className="h-full flex flex-col justify-between">
          <div className="overflow-y-auto">
            <div aria-labelledby="cart-lines p-0 first-of-type:pt-8 sm-max:pt-2 overflow-auto transition">
              <ul className="grid">
                {(cart?.lines?.nodes ?? []).map((line) => (
                  <CartLineItem key={line.id} line={line} layout={layout} />
                ))}
              </ul>
            </div>
          </div>
          <div>
            {cartHasItems && <CartSummary cart={cart} layout={layout} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
