import {Form, Outlet, Params, useMatches} from '@remix-run/react';
import type {
  Customer,
  MailingAddress,
  Order,
} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';
import {
  Button,
  OrderCard,
  AccountDetails,
  AccountAddressBook,
} from '~/components';
import {type AppLoadContext} from '@shopify/remix-oxygen';

import {doLogout} from '../routes/($lang).account.logout';
import {usePrefixPathWithLocale} from '~/lib/utils';

// Combining json + Response + defer in a loader breaks the
// types returned by useLoaderData. This is a temporary fix.

export default function Authenticated() {
  // const data = useLoaderData<typeof loader>();
  const [root] = useMatches();

  // Public routes
  if (!root?.data?.isLoggedIn) {
    return <Outlet />;
  }

  return <AccountWrapper {...(root?.data as Account)} />;
}

interface Account {
  customer: Customer;
  orders: Order[];
  heading: string;
  addresses: MailingAddress[];
  // featuredData: any; // @todo: help please
}

function AccountWrapper({customer, orders, addresses}: Account) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  return (
    <div className="grid grid-cols-1 grid-rows-[1fr_auto]">
      <div className="flex justify-between border-b border-t p-[calc(0.5em-1px)] md:p-[calc(0.5em-0.5px)]">
        <div>
          <button
            className={`mr-3 ${
              activeTab === 'profile' ? 'font-semibold' : 'font-regular'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`${
              activeTab === 'orders' ? 'font-semibold' : 'font-regular'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>
        <Form
          method="POST"
          action={usePrefixPathWithLocale('/account/logout')}
          reloadDocument
        >
          <button type="submit" className="text-black">
            Log out
          </button>
        </Form>
      </div>
      <div className="grid gap-4 p-4">
        {activeTab === 'orders' && orders ? (
          <AccountOrderHistory orders={orders} />
        ) : (
          <>
            <AccountDetails customer={customer} />
            <AccountAddressBook addresses={addresses} customer={customer} />
          </>
        )}

        {/* {!orders.length && (
          <Suspense>
            <Await
              resolve={featuredData}
              errorElement="There was a problem loading featured products."
            >
              {(data) => (
                <>
                  <FeaturedCollections
                    title="Popular Collections"
                    collections={data.featuredCollections as Collection[]}
                  />
                  <ProductSwimlane products={data.featuredProducts} />
                </>
              )}
            </Await>
          </Suspense>
        )} */}
      </div>
    </div>
  );
}

function AccountOrderHistory({orders}: {orders: Order[]}) {
  return (
    <>
      <h2 className="font-bold text-lead">Order History</h2>
      {orders?.length ? <Orders orders={orders} /> : <EmptyOrders />}
    </>
  );
}

function EmptyOrders() {
  return (
    <div>
      <p className="mb-1">You haven&apos;t placed any orders yet.</p>
      <div>
        <Button
          className="w-full mt-2 text-sm"
          variant="secondary"
          to={usePrefixPathWithLocale('/')}
        >
          START SHOPPING
        </Button>
      </div>
    </div>
  );
}

function Orders({orders}: {orders: Order[]}) {
  return (
    <ul className="grid grid-flow-row grid-cols-1 gap-4">
      {orders.map((order) => (
        <OrderCard order={order} key={order.id} />
      ))}
    </ul>
  );
}

const CUSTOMER_QUERY = `#graphql
  query CustomerDetails(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      firstName
      lastName
      phone
      email
      defaultAddress {
        id
        formatted
        firstName
        lastName
        company
        address1
        address2
        country
        province
        city
        zip
        phone
      }
      addresses(first: 6) {
        edges {
          node {
            id
            formatted
            firstName
            lastName
            company
            address1
            address2
            country
            province
            city
            zip
            phone
          }
        }
      }
      orders(first: 250, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 2) {
              edges {
                node {
                  # variant {
                  #   image {
                  #     url
                  #     altText
                  #     height
                  #     width
                  #   }
                  # }
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getCustomer(
  context: AppLoadContext,
  customerAccessToken: string,
  params: Params,
  request: Request,
) {
  const {storefront} = context;

  const data = await storefront.query<{
    customer: Customer;
  }>(CUSTOMER_QUERY, {
    cache: storefront.CacheNone(),
    variables: {
      customerAccessToken,
      country: context.storefront.i18n.country,
      language: context.storefront.i18n.language,
    },
  });

  /**
   * If the customer failed to load, we assume their access token is invalid.
   */
  if (!data || !data.customer) {
    throw await doLogout(context, params, request);
  }

  return data.customer;
}
