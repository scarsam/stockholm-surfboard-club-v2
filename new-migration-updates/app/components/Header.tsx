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
    <header className="bg-white sticky top-0 z-50 border-[#e5e7eb] border-b">
      <div className="h-10 px-2 flex items-center justify-between flex-wrap mx-auto">
        <HeaderMenuMobileToggle />
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
  const className = `header-menu-${viewport} border-t px-2 w-full overflow-x-auto border-[#e5e7eb]`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      <div className="flex flex-col mt-5 lg:mt-0 lg:flex-row gap-1">
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
                `font-medium lg:h-10 flex items-center whitespace-nowrap pb-1 lg:pb-0 px-0 lg:px-2 first:pl-0 last:pr-0 text-black hover:-skew-x-[20deg] ${
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
      </div>
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  const {open, close, type} = useAside();

  return (
    <nav
      className="header-ctas border-l lg:border-none h-full border-[#e5e7eb]"
      role="navigation"
    >
      <SearchToggle />

      <Suspense>
        <Await resolve={isLoggedIn}>
          {(isLoggedIn) =>
            isLoggedIn ? (
              <button
                className="mx-1 hidden lg:block"
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
                className="mx-1 hidden lg:block"
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
  const {open, close, type} = useAside();

  const isOpen = type !== 'closed';

  return (
    <button
      className="header-menu-mobile-toggle border-r border-[#e5e7eb] h-full pr-2 hover:cursor-pointer"
      onClick={() => (isOpen ? close() : open('mobile'))}
    >
      <span className="sr-only">Open main menu</span>
      <svg
        className="w-6 h-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  );
}

function SearchToggle() {
  return (
    <NavLink className="reset mx-4 lg:mx-1 " to="/search">
      <img
        className="inline"
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
