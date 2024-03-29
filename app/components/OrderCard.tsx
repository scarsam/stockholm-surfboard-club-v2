import {Image, flattenConnection} from '@shopify/hydrogen';
import type {Order} from '@shopify/hydrogen/storefront-api-types';
import {Heading, Text, Link} from '~/components';
import {statusMessage} from '~/lib/utils';

export function OrderCard({order}: {order: Order}) {
  if (!order?.id) return null;
  const [legacyOrderId, key] = order!.id!.split('/').pop()!.split('?');
  const lineItems = flattenConnection(order?.lineItems);

  return (
    <li className="grid text-center border rounded">
      <div
        className="grid items-center gap-4 p-0 md:gap-6 md:p-0 md:grid-cols-2"
        // to={`/account/orders/${legacyOrderId}?${key}`}
        // prefetch="intent"
      >
        {lineItems[0].variant?.image && (
          <div className="card-image aspect-square bg-primary/5">
            <Image
              width={168}
              height={168}
              className="w-full fadeIn cover"
              alt={lineItems[0].variant?.image?.altText ?? 'Order image'}
              src={lineItems[0].variant?.image.url}
            />
          </div>
        )}
        <div
          className={`flex-col justify-center text-left ${
            !lineItems[0].variant?.image && 'md:col-span-2'
          }`}
        >
          <Heading as="h3" format size="copy">
            {lineItems.length > 1
              ? `${lineItems[0].title} +${lineItems.length - 1} more`
              : lineItems[0].title}
          </Heading>
          <dl className="grid grid-gap-">
            <dt className="sr-only">Order ID</dt>
            <dd>
              <Text size="copy">Order No. {order.orderNumber}</Text>
            </dd>
            <dt className="sr-only">Order Date</dt>
            <dd>
              <Text size="copy">
                {new Date(order.processedAt).toDateString()}
              </Text>
            </dd>
            <dt className="sr-only">Fulfillment Status</dt>
            <dd className="mt-2">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  order.fulfillmentStatus === 'FULFILLED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-primary/5 text-primary/50'
                }`}
              >
                <Text size="fine">
                  {statusMessage(order.fulfillmentStatus)}
                </Text>
              </span>
            </dd>
          </dl>
        </div>
      </div>
      {/* <div className="self-end border-t">
        <Link
          className="block w-full p-2 text-center"
          to={`/account/orders/${legacyOrderId}?${key}`}
          prefetch="intent"
        >
          <Text color="subtle" className="ml-3">
            View Details
          </Text>
        </Link>
      </div> */}
    </li>
  );
}
