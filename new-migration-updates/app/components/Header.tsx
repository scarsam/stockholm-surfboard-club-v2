import {Suspense} from 'react';
import {Await, NavLink, useLocation} from '@remix-run/react';
import {type CartViewPayload, useAnalytics} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import logo from '~/assets/stockholm-surfboard-logo.svg';
import search from '~/assets/search-icon.svg';
import account from '~/assets/account-icon.svg';
import cartIcon from '~/assets/cart-icon.svg';
import emptyCartIcon from '~/assets/empty-cart-icon.svg';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, filterMenu} = header;

  return (
    <header className="hidden lg:block bg-white sticky top-0 z-50">
      <div className="h-10 px-2 flex items-center justify-between flex-wrap mx-auto">
        <NavLink
          prefetch="intent"
          to="/collections/new"
          className="py-3 select-none"
          end
        >
          <img alt={shop.name} src={logo} />
        </NavLink>
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
      <HeaderMenu
        menu={filterMenu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['filterMenu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport} border-y px-2 w-full overflow-x-auto gap-1 border-[#e5e7eb]`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className={({isActive}) =>
              `font-medium h-10 px-2 flex items-center whitespace-nowrap first:pl-0 last:pr-0 text-black hover:-skew-x-[20deg] ${
                isActive ? 'font-semibold' : 'font-medium'
              }`
            }
            end
            style={{textDecoration: 'none'}}
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open, close, type} = useAside();

  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <SearchToggle />
      <Suspense>
        <Await resolve={isLoggedIn}>
          {(isLoggedIn) =>
            isLoggedIn ? (
              <button
                className="mx-1"
                onClick={() => (type === 'closed' ? open('account') : close())}
              >
                <img
                  className="hover:cursor-pointer"
                  src={account}
                  width="16"
                  height="16"
                  alt="account-icon"
                />
              </button>
            ) : (
              <NavLink
                prefetch="intent"
                to="/account"
                style={activeLinkStyle}
                className="mx-1"
              >
                <img
                  className="hover:cursor-pointer"
                  src={account}
                  width="16"
                  height="16"
                  alt="account-icon"
                />
              </NavLink>
            )
          }
        </Await>
      </Suspense>
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  return (
    <NavLink className="reset mx-1" to="/search">
      <img
        className="inline mx-1"
        src={search}
        width="16"
        height="16"
        alt="search-icon"
      />
    </NavLink>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      className="relative inline-flex items-center justify-center mx-1 focus:ring-primary/5"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      <img
        src={count ? cartIcon : emptyCartIcon}
        width="16"
        height="16"
        alt="cart-icon"
      />
      {count ? (
        <div
          className={
            'text-white absolute bottom-0 top-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px'
          }
        >
          <span>{count}</span>
        </div>
      ) : null}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
