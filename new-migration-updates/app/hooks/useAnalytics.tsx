// Todo: Clean up?
// Todo: https://shopify.dev/docs/api/hydrogen/2024-04/hooks/useanalytics

import {useLocation, useFetchers, useMatches} from '@remix-run/react';

import {
  AnalyticsEventName,
  getClientBrowserParameters,
  sendShopifyAnalytics,
  ShopifyAddToCartPayload,
  ShopifyPageViewPayload,
  useShopifyCookies,
} from '@shopify/hydrogen';
import {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useEffect, useState} from 'react';
import {Locale} from '~/data/countries';

enum CartAction {
  ADD_TO_CART = 'ADD_TO_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  UPDATE_CART = 'UPDATE_CART',
  UPDATE_DISCOUNT = 'UPDATE_DISCOUNT',
  UPDATE_BUYER_IDENTITY = 'UPDATE_BUYER_IDENTITY',
}

type CookieConsent = {
  necessary: boolean;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
};

function getCookiebotConsent(): CookieConsent {
  const consent: CookieConsent = {
    necessary: false,
    preferences: false,
    statistics: false,
    marketing: false,
  };

  try {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const cookiebotConsent = window.Cookiebot?.consent;

      if (cookiebotConsent) {
        consent.necessary = !!cookiebotConsent['necessary'];
        consent.preferences = !!cookiebotConsent['preferences'];
        consent.statistics = !!cookiebotConsent['statistics'];
        consent.marketing = !!cookiebotConsent['marketing'];
      }
    }
  } catch (error) {
    return consent;
  }

  return consent;
}

function useGTM(gtmId: string, hasAnalyticsConsent: boolean) {
  useEffect(() => {
    if (typeof window !== 'undefined' && hasAnalyticsConsent) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

      const firstScript = document.getElementsByTagName('script')[0];

      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head
          ? document.head.appendChild(script)
          : document.body.appendChild(script);
      }

      return () => {
        if (firstScript?.parentNode) {
          firstScript.parentNode?.removeChild(script);
        } else {
          document.head
            ? document.head.removeChild(script)
            : document.body.removeChild(script);
        }
      };
    }
  }, [gtmId, hasAnalyticsConsent]);
}

function useCookieBot(cbid = '9bf1083c-0f1f-4b2d-9b4f-c20b694fcfc3') {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://consent.cookiebot.com/uc.js';
      script.id = 'Cookiebot';
      script.setAttribute('data-cbid', cbid);
      script.setAttribute('data-blockingmode', 'auto');
      script.async = true;
      script.defer = true;
      script.type = 'text/javascript';

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [cbid]);
}

type GTMEvent = {
  eventName: string;
  value: string;
  currency: string;
  items: Array<{
    name: string;
    id: string;
    price: string;
    quantity?: number;
    category?: string;
  }>;
};

function addGTMEvent(event: GTMEvent) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore

    window.dataLayer.push({
      event: event.eventName,
      ecommerce: {
        currency: event.currency, //'currency_code',  ISO 4217 currency code
        value: event.value, // Total value of the event (e.g., purchase amount)
        items: event.items.map((item) => ({
          item_name: item.name, //'product_name',  Required. Verify against actual product object.
          item_id: item.id, //'product_variant_id',  Required. Verify against actual product object.
          price: item.price, //product_price,  Required.
          quantity: item.quantity, // product_quantity,  Required.
          item_category: item.category, //'product_category',  Optional.
        })),
      },
    });
  } catch (error) {
    //TODO: handle error
  }
}

const isProduction = process.env.NODE_ENV === 'production';

export function useAnalytics(locale: Locale) {
  const [consent, setConsent] = useState<CookieConsent>(getCookiebotConsent());

  const hasAnalyticsConsent = consent.marketing;

  useShopifyCookies({hasUserConsent: hasAnalyticsConsent});

  useGTM('G-FC788PJZLH', hasAnalyticsConsent);
  useCookieBot();

  const location = useLocation();
  const analyticsFromMatches = useDataFromMatches(
    'analytics',
  ) as unknown as ShopifyPageViewPayload;

  const pageAnalytics = {
    ...analyticsFromMatches,
    currency: locale.label as CurrencyCode,
    acceptedLanguage: locale.language,
    hasUserConsent: hasAnalyticsConsent,
  };

  useEffect(() => {
    function getConsent() {
      setConsent(getCookiebotConsent());
    }

    window.addEventListener('CookiebotOnConsentReady', getConsent);

    return () => {
      window.removeEventListener('CookiebotOnConsentReady', getConsent);
    };
  }, []);

  // Page view analytics
  // We want useEffect to execute only when location changes
  // which represents a page view
  useEffect(() => {
    const payload: ShopifyPageViewPayload = {
      ...getClientBrowserParameters(),
      ...pageAnalytics,
    };

    sendShopifyAnalytics({
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload,
    });

    if (hasAnalyticsConsent && isProduction) {
      const product = payload.products?.[0];

      if (product) {
        addGTMEvent({
          eventName: 'view_item',
          value: product.price,
          currency: locale.label as CurrencyCode, // Todo: This is not correct
          items: [
            {
              name: product.name,
              id: product.variantGid ?? product.productGid,
              price: product.price,
              quantity: product.quantity,
              category: product.category,
            },
          ],
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Add to cart analytics
  const cartData = useDataFromFetchers({
    formDataKey: 'cartAction',
    formDataValue: CartAction.ADD_TO_CART,
    dataKey: 'analytics',
  }) as unknown as ShopifyAddToCartPayload;
  if (cartData) {
    const addToCartPayload: ShopifyAddToCartPayload = {
      ...getClientBrowserParameters(),
      ...pageAnalytics,
      ...cartData,
    };

    sendShopifyAnalytics({
      eventName: AnalyticsEventName.ADD_TO_CART,
      payload: addToCartPayload,
    });

    if (hasAnalyticsConsent && isProduction) {
      const product = cartData.products?.[0];

      if (product) {
        addGTMEvent({
          eventName: 'add_to_cart',
          value: product.price,
          currency: locale.label as CurrencyCode, // Todo: This is not correct
          items: [
            {
              name: product.name,
              id: product.variantGid ?? product.productGid,
              price: product.price,
              quantity: product.quantity,
              category: product.category,
            },
          ],
        });
      }
    }
  }
}

/**
 * Collects data under a certain key from useMatches
 * @param dataKey - The key in `event.data` to collect data from
 * @returns A merged object of the specified key
 *
 * @example
 * ```tsx
 * import {
 *   useDataFromMatches
 * } from '@shopify/hydrogen';
 *
 * export async function loader({request, context}: LoaderFunctionArgs) {
 *   return defer({
 *     analytics: {
 *       shopId: 'gid://shopify/Shop/1',
 *     },
 *   });
 * }
 *
 * export default function App() {
 *   const analytics = useDataFromMatches('analytics');
 *
 *   // {
 *   //   shopId: 'gid://shopify/Shop/1',
 *   // }
 * ```
 **/
function useDataFromMatches(dataKey: string): Record<string, unknown> {
  const matches = useMatches();
  const data: Record<string, unknown> = {};

  matches.forEach((event) => {
    const eventData = event?.data;
    if (eventData && eventData[dataKey]) {
      Object.assign(data, eventData[dataKey]);
    }
  });

  return data;
}

/**
 * Collects data under a certain key from useFetches.
 *
 * @param formDataKey - The form data key
 * @param formDataValue - The value of formDataKey
 * @param dataKey - the key in `fetcher.data` to collect data from
 * @returns A merged object of the specified key
 *
 * @example
 * ```tsx
 * // In routes/cart.tsx
 * import {
 *   useDataFromFetchers
 * } from '@shopify/hydrogen';
 *
 * export async function action({request, context}: ActionFunctionArgs) {
 *   const cartId = await session.get('cartId');
 *   ...
 *   return json({
 *     analytics: {
 *       cartId,
 *     },
 *   });
 * }
 *
 * // Anywhere when an action can be requested, make sure there is a form input and value
 * // to identify the fetcher
 * export function AddToCartButton({
 *   ...
 *   return (
 *     <fetcher.Form action="/cart" method="POST">
 *       <input type="hidden" name="cartAction" value={CartAction.ADD_TO_CART} />
 *
 * // You can add additional data as hidden form inputs and it will also be collected
 * // As long as it is JSON parse-able.
 * export function AddToCartButton({
 *
 *   const analytics = {
 *     products: [product]
 *   };
 *
 *   return (
 *     <fetcher.Form action="/cart" method="POST">
 *       <input type="hidden" name="cartAction" value={CartAction.ADD_TO_CART} />
 *       <input type="hidden" name="analytics" value={JSON.stringify(analytics)} />
 *
 * // In root.tsx
 * export default function App() {
 *   const cartData = useDataFromFetchers({
 *     formDataKey: 'cartAction',
 *     formDataValue: CartAction.ADD_TO_CART,
 *     dataKey: 'analytics',
 *   });
 *
 *   // {
 *   //   cartId: 'gid://shopify/Cart/abc123',
 *   //   products: [...]
 *   // }
 * ```
 **/
function useDataFromFetchers({
  formDataKey,
  formDataValue,
  dataKey,
}: {
  formDataKey: string;
  formDataValue: unknown;
  dataKey: string;
}): Record<string, unknown> | undefined {
  const fetchers = useFetchers();
  const data: Record<string, unknown> = {};

  for (const fetcher of fetchers) {
    const formData = fetcher?.formData;
    const fetcherData = fetcher.data;
    if (
      formData &&
      formData.get(formDataKey) === formDataValue &&
      fetcherData &&
      fetcherData[dataKey]
    ) {
      Object.assign(data, fetcherData[dataKey]);

      try {
        if (formData.get(dataKey)) {
          const dataInForm: unknown = JSON.parse(String(formData.get(dataKey)));
          Object.assign(data, dataInForm);
        }
      } catch {
        // do nothing
      }
    }
  }
  return Object.keys(data).length ? data : undefined;
}
