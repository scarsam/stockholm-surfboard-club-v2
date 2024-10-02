import {
  Fetcher,
  Form,
  Link,
  useActionData,
  useFetchers,
  useNavigation,
} from '@remix-run/react';
import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

import {
  AddressFragment,
  CustomerFragment,
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from './PaginatedResourceSection';
import {flattenConnection} from '@shopify/hydrogen';
import {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import {ActionResponse as ProfileActionResponse} from '~/routes/($locale).account_.profile';
import {ActionResponse as AddressActionResponse} from '~/routes/($locale).account_.addresses';

export function Account({
  customer,
  orders,
}: {
  customer: CustomerFragment | null;
  orders: CustomerOrdersFragment['orders'] | null;
}) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  return (
    <div className="grid grid-cols-1 grid-rows-[1fr_auto]">
      <div className="flex justify-between border-b border-t border-[#E0E0E0] p-[calc(0.5em-1px)] md:p-[calc(0.5em-0.5px)]">
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

        <Form className="account-logout" method="POST" action="/account/logout">
          &nbsp;
          <button className="text-black" type="submit">
            Log out
          </button>
        </Form>
      </div>
      <div className="grid gap-4 p-4">
        {activeTab === 'orders' && orders ? (
          <OrdersTable orders={orders} />
        ) : (
          <>
            {customer ? (
              <>
                <AccountProfile customer={customer} />
                <Addresses customer={customer} />
              </>
            ) : (
              <p>No customer information</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrdersTable({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div className="acccount-orders">
      <h2 className="font-bold">Order History</h2>
      {orders?.nodes.length ? (
        <PaginatedResourceSection connection={orders}>
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div>
      <p>You haven&apos;t placed any orders yet.</p>
      <br />
      <p>
        <Link to="/collections/new">Start Shopping →</Link>
      </p>
    </div>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;

  return (
    <>
      <div className="grid text-center border rounded border-[#e5e7eb] mb-4">
        <div className="grid items-center gap-4 p-0 md:gap-6 md:p-0 md:grid-cols-2">
          {order?.lineItems.nodes[0].image && (
            <div className="card-image aspect-square bg-primary/5">
              <Image
                width={168}
                height={168}
                className="w-full fadeIn cover"
                alt={order?.lineItems.nodes[0]?.image?.altText ?? 'Order image'}
                src={order?.lineItems.nodes[0]?.image.url}
              />
            </div>
          )}
          <div
            className={`flex-col justify-center text-left ${
              !order?.lineItems.nodes[0]?.image && 'md:col-span-2'
            }`}
          >
            <h3>
              {order?.lineItems.nodes && order?.lineItems.nodes.length > 1
                ? `${order?.lineItems.nodes[0].title} +${
                    order?.lineItems.nodes.length - 1
                  } more`
                : order?.lineItems.nodes[0].title}
            </h3>
            <dl className="grid">
              <dt className="sr-only">Order ID</dt>
              <dd>
                <p>Order No. {order.number}</p>
              </dd>
              <dt className="sr-only">Order Date</dt>
              <dd>
                <p>{new Date(order.processedAt).toDateString()}</p>
              </dd>
              <dt className="sr-only">Fulfillment Status</dt>
              <dd className="mt-2">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    fulfillmentStatus && fulfillmentStatus === 'SUCCESS'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-primary/5 text-primary/50'
                  }`}
                >
                  {fulfillmentStatus}
                </span>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

function AccountProfile({customer}: {customer: CustomerFragment}) {
  const {state} = useNavigation();
  const action = useActionData<ProfileActionResponse>();

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-col">
        <Form method="PUT" action="/account/profile">
          <h3 className="font-bold text-lead mb-4">Personal infos</h3>
          <fieldset>
            <div>
              <label
                htmlFor="firstName"
                className="flex flex-col text-xs gap-1 text-[#4D4D4D]"
              >
                First name
                <input
                  className="px-2 py-2 border-1 text-black text-base"
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="First name"
                  aria-label="First name"
                  defaultValue={customer.firstName ?? ''}
                  minLength={2}
                />
              </label>
            </div>
            <div className="mt-3">
              <label
                className="flex flex-col text-xs gap-1 text-[#4D4D4D]"
                htmlFor="lastName"
              >
                Last name
                <input
                  className="px-2 py-2 border-1 text-black text-base"
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last name"
                  aria-label="Last name"
                  defaultValue={customer.lastName ?? ''}
                  minLength={2}
                />
              </label>
            </div>
          </fieldset>
          {action?.error ? (
            <p>
              <mark>
                <small>{action.error}</small>
              </mark>
            </p>
          ) : (
            <br />
          )}
          <button
            className="border border-black uppercase py-2 px-10 w-full mb-2"
            type="submit"
            disabled={state !== 'idle'}
          >
            {state !== 'idle' ? 'Updating' : 'Update'}
          </button>
        </Form>
      </div>
    </div>
  );
}

function Addresses({customer}: {customer: CustomerFragment}) {
  const {defaultAddress, addresses} = customer;

  return (
    <div className="grid w-full gap-4 border-t pt-6">
      <div className="flex flex-col">
        <h3 className="font-bold text-lead">Address book</h3>
        {!addresses.nodes.length ? (
          <p>You have no addresses saved.</p>
        ) : (
          <div>
            <NewAddressForm />
            <ExistingAddresses
              addresses={addresses}
              defaultAddress={defaultAddress}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="mt-6 mb-4">
          <button
            className="inline-block font-medium text-center py-3 px-6 border ease-in-out duration-200 bg-black text-white w-full focus:shadow-outline"
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
          >
            {stateForMethod('POST') !== 'idle' ? 'SAVING' : 'SAVE'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div>
      {addresses.nodes.map((address) => (
        <AddressForm
          key={address.id}
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div key={address.id} className="mt-6 mb-4">
              <button
                className="inline-block font-medium text-center py-3 px-6 border ease-in-out duration-200 bg-black text-white w-full focus:shadow-outline"
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
              >
                {stateForMethod('PUT') !== 'idle' ? 'SAVING' : 'SAVE'}
              </button>
              {/* <button
                  disabled={stateForMethod('DELETE') !== 'idle'}
                  formMethod="DELETE"
                  type="submit"
                >
                  {stateForMethod('DELETE') !== 'idle' ? 'DELETING' : 'DELETE'}
                </button> */}
            </div>
          )}
        </AddressForm>
      ))}
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);
  const {state, formMethod} = useNavigation();
  const action = useActionData<AddressActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <div className="p-2 border border-gray-200 rounded flex flex-col mt-2">
      {editMode ? (
        <Form id={addressId} action="/account/addresses" navigate={false}>
          <fieldset>
            <input type="hidden" name="addressId" defaultValue={addressId} />
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="First name"
                autoComplete="given-name"
                defaultValue={address?.firstName ?? ''}
                id="firstName"
                name="firstName"
                placeholder="First name"
                required
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="Last name"
                autoComplete="family-name"
                defaultValue={address?.lastName ?? ''}
                id="lastName"
                name="lastName"
                placeholder="Last name"
                required
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="Company"
                autoComplete="organization"
                defaultValue={address?.company ?? ''}
                id="company"
                name="company"
                placeholder="Company"
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="Address line 1"
                autoComplete="address-line1"
                defaultValue={address?.address1 ?? ''}
                id="address1"
                name="address1"
                placeholder="Address line 1*"
                required
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="Address line 2"
                autoComplete="address-line2"
                defaultValue={address?.address2 ?? ''}
                id="address2"
                name="address2"
                placeholder="Address line 2"
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="City"
                autoComplete="address-level2"
                defaultValue={address?.city ?? ''}
                id="city"
                name="city"
                placeholder="City"
                required
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="State/Province"
                autoComplete="address-level1"
                defaultValue={address?.zoneCode ?? ''}
                id="zoneCode"
                name="zoneCode"
                placeholder="State / Province"
                // required // Todo: Why does this not work??
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="Zip"
                autoComplete="postal-code"
                defaultValue={address?.zip ?? ''}
                id="zip"
                name="zip"
                placeholder="Zip / Postal Code"
                required
                type="text"
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="territoryCode"
                autoComplete="country"
                defaultValue={address?.territoryCode ?? ''}
                id="territoryCode"
                name="territoryCode"
                placeholder="Country"
                required
                type="text"
                maxLength={2}
              />
            </div>
            <div className="mt-3">
              <input
                className="px-2 py-2 border-1 text-black text-base w-full"
                aria-label="Phone Number"
                autoComplete="tel"
                defaultValue={address?.phoneNumber ?? ''}
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+16135551111"
                pattern="^\+?[1-9]\d{3,14}$"
                type="tel"
              />
            </div>
            <div className="mt-4 flex items-center">
              <input
                className="border-gray-500 rounded-sm cursor-pointer border-1 accent-[#000000] text-black focus:ring-0"
                defaultChecked={isDefaultAddress}
                id="defaultAddress"
                name="defaultAddress"
                type="checkbox"
              />
              <label
                className="inline-block ml-2 text-sm cursor-pointer"
                htmlFor="defaultAddress"
              >
                Set as default address
              </label>
            </div>
            {error && (
              <p>
                <mark>
                  <small>{error}</small>
                </mark>
              </p>
            )}
            {children({
              stateForMethod: (method) =>
                formMethod === method ? state : 'idle',
            })}
            <button
              onClick={() => setEditMode(false)}
              className="border border-black uppercase py-2 px-10 block w-full mb-4"
            >
              CANCEL
            </button>
          </fieldset>
        </Form>
      ) : (
        <>
          <ul className="flex-1 flex-row">
            {isDefaultAddress && (
              <li>
                <strong>Default Address</strong>
              </li>
            )}
            {(address.firstName || address.lastName) && (
              <li>
                {address.firstName &&
                  address.firstName + ' ' + address?.lastName}
              </li>
            )}
            {address.address1 && <li>{address.address1}</li>}
            {address.address2 && <li>{address.address2}</li>}
            {address.city && address.zoneCode && address.zip && (
              <li>
                {address.city}, {address.zoneCode} {address.zip}
              </li>
            )}
            {address.territoryCode && <li>{address.territoryCode}</li>}
          </ul>
          <div>
            <button
              onClick={() => setEditMode(true)}
              className="border border-black uppercase py-2 px-10 block"
            >
              {addressId === 'NEW_ADDRESS_ID' ? 'ADD ADDRESS' : 'EDIT ADDRESS'}
            </button>
            {!editMode && addressId !== 'NEW_ADDRESS_ID' && (
              <button
                className="border border-black uppercase py-2 px-10 mt-2"
                disabled={state !== 'idle'}
                formMethod="DELETE"
                type="submit"
              >
                {state !== 'idle' ? 'REMOVING' : 'REMOVE'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
