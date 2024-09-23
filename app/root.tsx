import {
  defer,
  type LinksFunction,
  type LoaderFunctionArgs,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from '@remix-run/react';
import {
  ShopifySalesChannel,
  Seo,
  flattenConnection,
  useLoadScript,
} from '@shopify/hydrogen';
import {Layout} from '~/components';
import {GenericError} from './components/GenericError';
import {NotFound} from './components/NotFound';
import styles from './styles/app.css';
import favicon from '../public/favicon.ico';
import {seoPayload} from '~/lib/seo.server';
import {
  DEFAULT_LOCALE,
  parseMenu,
  getCartId,
  type EnhancedMenu,
} from './lib/utils';
import invariant from 'tiny-invariant';
import {
  Shop,
  Cart,
  Order,
  MailingAddress,
} from '@shopify/hydrogen/storefront-api-types';
import {useAnalytics} from './hooks/useAnalytics';
import {countries} from './data/countries';
import {getCustomer} from './components/Account';
import {getFeaturedData} from './routes/($lang).featured-products';
import {useEffect} from 'react';


export const links: LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: styles},
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/x-icon', href: favicon},
  ];
};

export async function loader({request, params, context}: LoaderFunctionArgs) {
  const cartId = getCartId(request);
  const [customerAccessToken, layout] = await Promise.all([
    context.session.get('customerAccessToken'),
    getLayoutData(context),
  ]);

  const seo = seoPayload.root({shop: layout.shop, url: request.url});

  let customer;
  let orders;
  let addresses;
  let featuredData;

  if (customerAccessToken) {
    customer = await getCustomer(context, customerAccessToken, params, request);
    orders = flattenConnection(customer.orders) as Order[];
    addresses = flattenConnection(customer.addresses) as MailingAddress[];
    featuredData = getFeaturedData(context.storefront);
  }

  return defer({
    isLoggedIn: Boolean(customerAccessToken),
    layout,
    customer,
    orders,
    addresses,
    featuredData,
    countries: {...countries},
    selectedLocale: context.storefront.i18n,
    cart: cartId ? getCart(context, cartId) : undefined,
    analytics: {
      shopifySalesChannel: ShopifySalesChannel.hydrogen,
      shopId: layout.shop.id,
    },
    seo,
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  const locale = data?.selectedLocale ?? DEFAULT_LOCALE;

  useAnalytics(locale);


  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="google-site-verification"
          content="JyLUKiFuQI9W0FxCmLSbFCXGmTu7B8b4iQYSmNVslBQ"
        />
        <Seo />
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          layout={data.layout as LayoutData}
          // key={`${locale.language}-${locale.country}`}
        >
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({error}: {error: Error}) {
  const [root] = useMatches();
  const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;
  const routeError = useRouteError();
  const isRouteError = isRouteErrorResponse(routeError);

  let title = 'Error';
  let pageType = 'page';

  if (isRouteError) {
    title = 'Not found';
    if (routeError.status === 404) pageType = routeError.data || pageType;
  }

  return (
    <html lang={locale.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta
          name="google-site-verification"
          content="JyLUKiFuQI9W0FxCmLSbFCXGmTu7B8b4iQYSmNVslBQ"
        />
        <title>{title}</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Layout
          layout={root?.data?.layout}
          key={`${locale.language}-${locale.country}`}
        >
          {isRouteError ? (
            <>
              {routeError.status === 404 ? (
                <NotFound type={pageType} />
              ) : (
                <GenericError
                  error={{message: `${routeError.status} ${routeError.data}`}}
                />
              )}
            </>
          ) : (
            <GenericError error={error instanceof Error ? error : undefined} />
          )}
        </Layout>
        <Scripts />
        {/* <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="9bf1083c-0f1f-4b2d-9b4f-c20b694fcfc3"
          data-blockingmode="auto"
          type="text/javascript"
          defer
          async
        /> */}
      </body>
    </html>
  );
}

const LAYOUT_QUERY = `#graphql
  query layoutMenus(
    $language: LanguageCode
    $headerMenuHandle: String!
    $filterMenuHandle: String!
    $footerMenuHandle: String!
  ) @inContext(language: $language) {
    shop {
      id
      name
      description
      primaryDomain {
        url
      }
      brand {
       logo {
         image {
          url
         }
       }
     }
    }
    headerMenu: menu(handle: $headerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
    filterMenu: menu(handle: $filterMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
    footerMenu: menu(handle: $footerMenuHandle) {
      id
      items {
        ...MenuItem
        items {
          ...MenuItem
        }
      }
    }
  }
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
`;

export interface LayoutData {
  headerMenu: EnhancedMenu;
  filterMenu: EnhancedMenu;
  footerMenu: EnhancedMenu;
  shop: Shop;
  cart?: Promise<Cart>;
}

async function getLayoutData({storefront}: AppLoadContext) {
  const HEADER_MENU_HANDLE = 'main-menu-v2';
  const FILTER_MENU_HANDLE = 'filter-menu-v2';
  const FOOTER_MENU_HANDLE = 'footer-v2';

  const data = await storefront.query<LayoutData>(LAYOUT_QUERY, {
    variables: {
      headerMenuHandle: HEADER_MENU_HANDLE,
      filterMenuHandle: FILTER_MENU_HANDLE,
      footerMenuHandle: FOOTER_MENU_HANDLE,
      language: storefront.i18n.language,
    },
  });

  invariant(data, 'No data returned from Shopify API');

  /*
    Modify specific links/routes (optional)
    @see: https://shopify.dev/api/storefront/unstable/enums/MenuItemType
    e.g here we map:
      - /blogs/news -> /news
      - /blog/news/blog-post -> /news/blog-post
      - /collections/all -> /products
  */
  const customPrefixes = {BLOG: '', CATALOG: 'products'};

  const headerMenu = data?.headerMenu
    ? parseMenu(data.headerMenu, customPrefixes)
    : undefined;

  const filterMenu = data?.filterMenu
    ? parseMenu(data.filterMenu, customPrefixes)
    : undefined;

  const footerMenu = data?.footerMenu
    ? parseMenu(data.footerMenu, customPrefixes)
    : undefined;

  return {shop: data.shop, filterMenu, headerMenu, footerMenu};
}

const CART_QUERY = `#graphql
  query CartQuery($cartId: ID!, $country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }

  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          attributes {
            key
            value
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              availableForSale
              compareAtPrice {
                ...MoneyFragment
              }
              price {
                ...MoneyFragment
              }
              requiresShipping
              title
              image {
                ...ImageFragment
              }
              product {
                handle
                title
                id
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalDutyAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
    }
  }

  fragment MoneyFragment on MoneyV2 {
    currencyCode
    amount
  }

  fragment ImageFragment on Image {
    id
    url
    altText
    width
    height
  }
`;

export async function getCart({storefront}: AppLoadContext, cartId: string) {
  invariant(storefront, 'missing storefront client in cart query');

  const {cart} = await storefront.query<{cart?: Cart}>(CART_QUERY, {
    variables: {
      cartId,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheNone(),
  });

  return cart;
}
