import clsx from 'clsx';
import {useRef} from 'react';
import {useScroll} from 'react-use';
import {flattenConnection, Image, Money} from '@shopify/hydrogen';
import {
  Button,
  Heading,
  IconRemove,
  Text,
  Link,
  FeaturedProducts,
} from '~/components';
import {getInputStyleClasses} from '~/lib/utils';
import type {
  Cart as CartType,
  CartCost,
  CartLine,
  CartLineUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';
import {useFetcher, useMatches} from '@remix-run/react';
import {CartAction} from '~/lib/type';
import {DrawerHeader} from './CartHeader';

type Layouts = 'page' | 'drawer';

export function Cart({
  layout,
  onClose,
  openAccount,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  openAccount: () => void;
  cart: CartType | null;
}) {
  const linesCount = Boolean(cart?.lines?.edges?.length || 0);

  return (
    <>
      <DrawerHeader
        title={`Bag: ${cart?.totalQuantity || 0}`}
        onClose={onClose}
      />
      <div className="px-2 pb-2">
        <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
        <CartDetails cart={cart} openAccount={openAccount} layout={layout} />
      </div>
    </>
  );
}

export function CartDetails({
  layout,
  cart,
  openAccount,
}: {
  layout: Layouts;
  cart: CartType | null;
  openAccount: () => void;
}) {
  const [root] = useMatches();
  // @todo: get optimistic cart cost
  const isZeroCost = !cart || cart?.cost?.subtotalAmount?.amount === '0.0';

  const container = {
    drawer: cart?.totalQuantity
      ? 'grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]'
      : 'hidden',
    page: 'w-full pb-12 grid md:grid-cols-2 md:items-start gap-8 md:gap-8 lg:gap-12',
  };

  return (
    <div className={container[layout]}>
      <CartLines lines={cart?.lines} layout={layout} />
      {!isZeroCost && (
        <CartSummary cost={cart.cost} layout={layout}>
          {/* <CartDiscounts discountCodes={cart.discountCodes} /> */}
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
          {!root.data.isLoggedIn && (
            <button
              onClick={openAccount}
              className="border border-black uppercase py-2 px-10 w-full"
              type="button"
            >
              Sign in
            </button>
          )}
        </CartSummary>
      )}
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType['discountCodes'];
}) {
  const codes = discountCodes?.map(({code}) => code).join(', ') || null;

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes ? 'grid' : 'hidden'}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button>
                <IconRemove
                  aria-hidden="true"
                  style={{height: 18, marginRight: 4}}
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes}</Text>
          </div>
        </div>
      </dl>

      {/* No discounts, show an input to apply a discount */}
      <UpdateDiscountForm>
        <div
          className={clsx(
            codes ? 'hidden' : 'flex',
            'items-center gap-4 justify-between text-copy',
          )}
        >
          <input
            className={getInputStyleClasses()}
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <button className="flex justify-end font-medium whitespace-nowrap">
            Apply Discount
          </button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({children}: {children: React.ReactNode}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.UPDATE_DISCOUNT}
      />
      {children}
    </fetcher.Form>
  );
}

function CartLines({
  layout = 'drawer',
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartType['lines'] | undefined;
}) {
  const currentLines = cartLines ? flattenConnection(cartLines) : [];
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  const className = clsx([
    y > 0 ? 'border-t' : '',
    layout === 'page'
      ? 'flex-grow md:translate-y-4'
      : 'p-0 first-of-type:pt-8 sm-max:pt-2 overflow-auto transition',
  ]);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={className}
    >
      <ul className="grid gap-6 md:gap-10">
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line as CartLine} />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <div className="flex flex-col mt-2">
      <a href={checkoutUrl} target="_self">
        <button
          type="submit"
          className="border bg-black text-white uppercase py-2 px-10 w-full"
        >
          Continue to Checkout
        </button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartCost;
  layout: Layouts;
}) {
  const summary = {
    drawer: 'grid gap-4 p-6 border-t md:px-12',
    page: 'sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-primary/5 rounded w-full',
  };

  return (
    <section aria-labelledby="summary-heading" className={summary[layout]}>
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      <dl className="grid">
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Subtotal</Text>
          <Text as="dd" data-test="subtotal">
            {cost?.subtotalAmount?.amount ? (
              <Money data={cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </Text>
        </div>
      </dl>
      {children}
    </section>
  );
}

function CartLineItem({line}: {line: CartLine}) {
  if (!line?.id) return null;

  const {id, quantity, merchandise} = line;

  if (typeof quantity === 'undefined' || !merchandise?.product) return null;

  return (
    <li key={id} className="flex gap-4 border-b pb-4">
      <div className="flex-shrink">
        {merchandise.image && (
          <Image
            aspectRatio="3/2"
            data={merchandise.image}
            className="object-cover object-center w-24 h-24 border rounded md:w-28 md:h-28"
            alt={merchandise.title}
          />
        )}
      </div>

      <div className="flex justify-between flex-grow">
        <div className="grid gap-2 flex-grow">
          <Heading className="font-semibold" as="h3" size="copy">
            {merchandise?.product?.handle ? (
              <Link to={`/products/${merchandise.product.handle}`}>
                {merchandise?.product?.title || ''}
              </Link>
            ) : (
              <Text>{merchandise?.product?.title || ''}</Text>
            )}
          </Heading>

          <div className="grid pb-2">
            {(merchandise?.selectedOptions || []).map((option) => (
              <Text key={option.name}>
                {option.name}: {option.value}
              </Text>
            ))}
            <Text>
              <CartLinePrice line={line} as="span" />
            </Text>
          </div>

          <div className="flex items-end flex-grow gap-2">
            <div className="flex flex-col justify-start text-copy flex-grow">
              <CartLineQuantityAdjust line={line} />
            </div>
          </div>
          <ItemRemoveButton lineIds={[id]} />
        </div>
      </div>
    </li>
  );
}

function ItemRemoveButton({lineIds}: {lineIds: CartLine['id'][]}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form action="/cart" method="post">
      <input
        type="hidden"
        name="cartAction"
        value={CartAction.REMOVE_FROM_CART}
      />
      <input type="hidden" name="linesIds" value={JSON.stringify(lineIds)} />
      <button
        className="flex items-center justify-center underline"
        type="submit"
      >
        Remove
      </button>
    </fetcher.Form>
  );
}

function CartLineQuantityAdjust({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>
      <label className="text-sm" htmlFor={`quantity-${lineId}`}>
        Quantity: <span className="sr-only">, {quantity}</span>
      </label>
      <div className="flex items-center border border-black h-[26px]">
        <UpdateCartButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="transition hover:text-primary disabled:text-primary/10 flex-1"
            value={prevQuantity}
            disabled={quantity <= 1}
          >
            <span>&#8722;</span>
          </button>
        </UpdateCartButton>

        <div
          className="px-2 text-center flex-1 border-x border-black"
          data-test="item-quantity"
        >
          {quantity}
        </div>

        <UpdateCartButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="transition hover:text-primary flex-1"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
          >
            <span>&#43;</span>
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form className="flex flex-1" action="/cart" method="post">
      <input type="hidden" name="cartAction" value={CartAction.UPDATE_CART} />
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      {children}
    </fetcher.Form>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />;
}

export function CartEmpty({
  hidden = false,
  layout = 'drawer',
  onClose,
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const {y} = useScroll(scrollRef);

  // grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto]
  const container = {
    drawer: clsx([
      // 'content-start pb-0 transition overflow-y-scroll  h-screen-no-nav',
      'content-start pb-0 transition',
      y > 0 ? 'border-t' : '',
    ]),
    page: clsx([
      hidden ? '' : 'grid',
      `pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12`,
    ]),
  };

  return (
    <div ref={scrollRef} className={container[layout]} hidden={hidden}>
      {/* <section className="grid gap-6">
        <Text format>
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </Text>
        <div>
          <Button onClick={onClose}>Continue shopping</Button>
        </div>
      </section> */}
      <section className="grid gap-4 pt-2">
        <FeaturedProducts
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        />
      </section>
    </div>
  );
}
