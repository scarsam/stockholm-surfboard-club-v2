import {
  type EnhancedMenu,
  type EnhancedMenuItem,
  useIsHomePath,
  urlPathname,
  isCurrentPath,
} from '~/lib/utils';
import {Drawer, useDrawer, Text, Cart, CartLoading, Link} from '~/components';
import {
  useParams,
  Form,
  Await,
  useMatches,
  useLocation,
} from '@remix-run/react';
import {useWindowScroll} from 'react-use';
import {Fragment, Suspense, useEffect, useMemo, useState} from 'react';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import type {LayoutData} from '../root';
import {
  CustomerAccessTokenCreatePayload,
  QueryRoot,
} from '@shopify/hydrogen/storefront-api-types';
import cart from '../../public/cart-icon.svg';
import search from '../../public/search-icon.svg';
import account from '../../public/account-icon.svg';
import globe from '../../public/globe-icon.svg';
import {useModal} from './Modals/useModal';
import Authenticated from './Account';
import {
  ActionFunction,
  AppLoadContext,
  json,
  LoaderArgs,
  redirect,
} from '@shopify/remix-oxygen';
import {Session} from './Session';

export const handle = {
  isPublic: true,
};

export function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LayoutData;
}) {
  const {Modal, setModal} = useModal();

  return (
    <>
      <Modal />
      <div className="flex flex-col min-h-screen antialiased bg-white">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header
          setModal={setModal}
          menu={layout?.headerMenu}
          filter={layout?.filterMenu}
          shop={layout?.shop}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
        <Footer setModal={setModal} menu={layout?.footerMenu} />
      </div>
    </>
  );
}

function Header({
  filter,
  menu,
  shop,
  setModal,
}: {
  filter: EnhancedMenu;
  menu: EnhancedMenu;
  shop: QueryRoot['shop'];
  setModal: React.Dispatch<
    React.SetStateAction<'location' | 'newsletter' | undefined>
  >;
}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const {
    isOpen: isAccountOpen,
    openDrawer: openAccount,
    closeDrawer: closeAccount,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <AccountDrawer
        shop={shop}
        isOpen={isAccountOpen}
        onClose={closeAccount}
      />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer
          isOpen={isMenuOpen}
          onClose={closeMenu}
          openCart={openCart}
          openMenu={openMenu}
          filter={filter}
          menu={menu}
          shop={shop}
        />
      )}

      <DesktopHeader
        setModal={setModal}
        filter={filter}
        menu={menu}
        shop={shop}
        openCart={openCart}
        openAccount={openAccount}
      />
      <MobileHeader
        shop={shop}
        openCart={openCart}
        openMenu={openMenu}
        onClose={closeMenu}
      />
    </>
  );
}

function AccountDrawer({
  isOpen,
  onClose,
  shop,
}: {
  isOpen: boolean;
  onClose: () => void;
  shop: QueryRoot['shop'];
}) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="right">
      <div className="grid">
        {root.data.isLoggedIn ? (
          <Authenticated />
        ) : (
          <Session onClose={onClose} name={shop.name} />
        )}
      </div>
    </Drawer>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="right">
      <div className="grid p-2">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  openCart,
  openMenu,
  filter,
  menu,
  shop,
}: {
  isOpen: boolean;
  onClose: () => void;
  openCart: () => void;
  openMenu: () => void;
  filter: EnhancedMenu;
  menu: EnhancedMenu;
  shop: QueryRoot['shop'];
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left">
      <div className="grid">
        <MenuMobileNav
          shop={shop}
          menu={menu}
          filter={filter}
          openMenu={openMenu}
          openCart={openCart}
          onClose={onClose}
        />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  shop,
  filter,
  menu,
  onClose,
  openCart,
  openMenu,
}: {
  shop: QueryRoot['shop'];
  filter: EnhancedMenu;
  menu: EnhancedMenu;
  onClose: () => void;
  openCart: () => void;
  openMenu: () => void;
}) {
  const {pathname} = useLocation();

  return (
    <ul className="flex flex-col absolute top-[20px] w-full bg-white h-[calc(100%-40px)]">
      {menu?.items.map((menuItem) => (
        <Fragment key={menuItem.id}>
          {menuItem?.title === 'Shop' ? (
            <div
              key={menuItem.id}
              className={`${
                isCurrentPath(pathname, menuItem?.url)
                  ? 'font-semibold'
                  : 'font-medium'
              } flex border-b py-2`}
            >
              <Link className="font-bold px-2" to={urlPathname(menuItem.url)}>
                {menuItem.title}
              </Link>
              <div className="flex-1 ml-12">
                {filter?.items.map((item) => (
                  <Link
                    key={item.id}
                    className={`${
                      isCurrentPath(pathname, item?.url)
                        ? 'font-semibold'
                        : 'font-medium'
                    } block whitespace-nowrap mb-2`}
                    to={urlPathname(item.url)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              className="font-bold px-2 flex items-center h-10 border-b"
              to={urlPathname(menuItem.url)}
            >
              {menuItem.title}
            </Link>
          )}
        </Fragment>
      ))}
    </ul>
  );
}

function MobileHeader({
  shop,
  openCart,
  openMenu,
  onClose,
}: {
  shop: QueryRoot['shop'];
  openCart: () => void;
  openMenu: () => void;
  onClose: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);
  const params = useParams();

  return (
    <nav className="lg:hidden">
      <header
        role="banner"
        className="h-10 flex items-center mx-auto border-black border-b"
      >
        <button
          onClick={openMenu}
          type="button"
          data-collapse-toggle="navbar-default"
          className="inline-flex justify-center h-full w-10 border-black border-r items-center text-sm text-black lg:hidden hover:bg-gray-200 focus:outline-none focus:ring-0"
          aria-controls="navbar-default"
          aria-expanded="false"
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
        <Link
          className="text-xl text-[#ED1C24] font-semibold border-black border-r flex-1 h-full items-center flex justify-center"
          to="/"
        >
          {shop.name}
        </Link>
        <div className="flex h-full items-center">
          <div className="border-black border-r h-full flex items-center justify-center w-10">
            <Form
              method="get"
              action={params.lang ? `/${params.lang}/search` : '/search'}
            >
              <button
                type="submit"
                className="relative flex items-center justify-center w-8 h-8"
              >
                <img
                  className="inline mx-1"
                  src={search}
                  width="16"
                  height="16"
                  alt="search-icon"
                />
              </button>
              {/* <Input
                className="focus:border-primary/20"
                type="search"
                variant="minisearch"
                placeholder="Search"
                name="q"
              /> */}
            </Form>
            {/* <img
              className="inline mx-1"
              src={search}
              width="16"
              height="16"
              alt="search-icon"
            /> */}
          </div>
          <div className="border-black border-r h-full flex items-center justify-center w-10">
            <button onClick={openCart} type="button">
              <img
                className="inline mx-1"
                src={cart}
                width="16"
                height="16"
                alt="cart-icon"
              />
            </button>
          </div>
        </div>
      </header>
    </nav>
  );
}

function DesktopHeader({
  shop,
  filter,
  menu,
  openCart,
  openAccount,
  setModal,
}: {
  shop: QueryRoot['shop'];
  filter: EnhancedMenu;
  menu: EnhancedMenu;
  openCart: () => void;
  openAccount: () => void;
  setModal: React.Dispatch<
    React.SetStateAction<'location' | 'newsletter' | undefined>
  >;
}) {
  const {pathname} = useLocation();
  const params = useParams();
  const {y} = useWindowScroll();

  return (
    <nav className="hidden lg:block relative z-10">
      {/* {openCart && <CartDetails />} */}
      <header
        role="banner"
        className="h-10 px-2 flex items-center justify-between flex-wrap mx-auto"
      >
        <Link className="text-2xl text-[#ED1C24] font-semibold" to="/">
          {shop.name}
        </Link>
        <div className="flex items-center">
          {menu?.items.map((menuItem) => (
            <Link
              key={`desktop-${menuItem.id}`}
              className={`mx-1 text-black ${
                isCurrentPath(pathname, menuItem?.url)
                  ? 'font-semibold'
                  : 'font-medium'
              }`}
              to={urlPathname(menuItem.url)}
            >
              {menuItem.title}
            </Link>
          ))}
          {/* <button onClick={() => setModal('newsletter')}>
            <img
              className="inline mx-1 hover:cursor-pointer"
              src={search}
              width="16"
              height="16"
              alt="search-icon"
            />
          </button> */}
          <div className="flex items-center">
            <Form
              method="get"
              action={params.lang ? `/${params.lang}/search` : '/search'}
              className="flex self-stretch items-center mx-1"
            >
              <button type="submit">
                <img
                  className="inline"
                  src={search}
                  width="16"
                  height="16"
                  alt="search-icon"
                />
              </button>
            </Form>
            <button onClick={() => setModal('location')} type="button">
              <img
                className="flex self-stretch items-center hover:cursor-pointer mx-1"
                src={globe}
                width="16"
                height="16"
                alt="globe-icon"
              />
            </button>
            <button
              className="flex self-stretch items-center mx-1"
              onClick={() => openAccount()}
            >
              <img
                className="hover:cursor-pointer"
                src={account}
                width="16"
                height="16"
                alt="account-icon"
              />
            </button>
            <CartCount isHome openCart={openCart} />
          </div>
        </div>
      </header>

      <div className="border-y px-2 flex items-center justify-between w-full overflow-x-auto flex-nowrap">
        {filter?.items.map((item) => (
          <Link
            key={`desktop-${item.id}`}
            className={`${
              isCurrentPath(pathname, item?.url)
                ? 'font-semibold'
                : 'font-medium'
            } h-10 px-2 flex items-center whitespace-nowrap first:pl-0 last:pr-0 text-black`}
            to={urlPathname(item.url)}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <img src={cart} width="16" height="16" alt="cart-icon" />
        <div
          className={`${
            dark ? 'text-primary bg-black' : 'text-contrast bg-primary'
          } absolute -bottom-1 -right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative inline-flex items-center justify-center mx-1 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative inline-flex items-center justify-center mx-1 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({
  menu,
  setModal,
}: {
  menu?: EnhancedMenu;
  setModal: React.Dispatch<
    React.SetStateAction<'location' | 'newsletter' | undefined>
  >;
}) {
  const isHome = useIsHomePath();

  return (
    <footer
      role="contentinfo"
      className="h-10 flex border-t border-black items-center px-2 justify-between"
    >
      <FooterMenu setModal={setModal} menu={menu} />
      <div>&copy; Stockholm Surfboard Club {new Date().getFullYear()}</div>
    </footer>
  );
}

const FooterLink = ({item}: {item: EnhancedMenuItem}) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};

function FooterMenu({
  menu,
  setModal,
}: {
  menu?: EnhancedMenu;
  setModal: React.Dispatch<
    React.SetStateAction<'location' | 'newsletter' | undefined>
  >;
}) {
  return (
    <div>
      {(menu?.items || []).map((item: EnhancedMenuItem) => (
        <Link to={item.url || ''} key={item.id} className="mr-3 inline-block">
          <Text className="flex justify-between uppercase text-sm">
            {item.title}
          </Text>
        </Link>
      ))}
      <button
        onClick={() => setModal('newsletter')}
        className="mr-3 inline-block"
      >
        <Text className="flex justify-between uppercase text-sm">
          Newsletter
        </Text>
      </button>
    </div>
  );
}
