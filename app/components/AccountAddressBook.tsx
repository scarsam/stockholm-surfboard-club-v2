import {Form, useFetcher} from '@remix-run/react';
import type {
  Customer,
  MailingAddress,
} from '@shopify/hydrogen/storefront-api-types';
import {Button, Text} from '~/components';

import {useActionData, useTransition} from '@remix-run/react';
import {flattenConnection} from '@shopify/hydrogen';

import {usePrefixPathWithLocale} from '~/lib/utils';
import {useState} from 'react';

export function AccountAddressBook({
  customer,
  addresses,
}: {
  customer: Customer;
  addresses: MailingAddress[];
}) {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="grid w-full gap-4 border-t pt-6">
      <div className="flex flex-col">
        <h3 className="font-bold text-lead">Address book</h3>
        <div>
          {!addresses?.length && (
            <Text className="mb-1" width="narrow" as="p" size="copy">
              You haven&apos;t saved any addresses yet.
            </Text>
          )}
          <div>
            <EditAddress
              editMode={editMode}
              setEditMode={setEditMode}
              customer={customer}
            />
          </div>
          {Boolean(addresses?.length) && (
            <div className="grid grid-cols-1 mt-2 gap-2">
              {customer.defaultAddress && (
                <Address
                  customer={customer}
                  address={customer.defaultAddress}
                  defaultAddress
                />
              )}
              {addresses
                .filter((address) => address.id !== customer.defaultAddress?.id)
                .map((address) => (
                  <Address
                    customer={customer}
                    key={address.id}
                    address={address}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Address({
  address,
  customer,
  defaultAddress,
}: {
  address: MailingAddress;
  customer: Customer;
  defaultAddress?: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const path = usePrefixPathWithLocale(`/account/address/delete`);

  return (
    <div className="p-2 border border-gray-200 rounded flex flex-col">
      {defaultAddress && (
        <div className="flex flex-row">
          <span className="py-1 text-xs font-medium rounded-full">Default</span>
        </div>
      )}
      <ul className="flex-1 flex-row">
        {(address.firstName || address.lastName) && (
          <li>
            {'' +
              (address.firstName && address.firstName + ' ') +
              address?.lastName}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line: string) => <li key={line}>{line}</li>)}
      </ul>

      <div className="flex flex-col font-medium mt-2 items-baseline">
        <EditAddress
          customer={customer}
          addressId={address.id}
          editMode={editMode}
          setEditMode={setEditMode}
        />
        {!editMode && (
          <Form className="mt-2" action={path} method="delete">
            <input type="hidden" name="addressId" value={address.id} />
            <button className="border border-black uppercase py-2 px-10">
              Remove
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}

export default function EditAddress({
  customer,
  addressId,
  editMode,
  setEditMode,
}: {
  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  customer: Customer;
  addressId?: string;
}) {
  const fetcher = useFetcher();
  const transition = useTransition();
  const addresses = flattenConnection(customer.addresses);
  const defaultAddress = customer.defaultAddress;

  /**
   * When a refresh happens (or a user visits this link directly), the URL
   * is actually stale because it contains a special token. This means the data
   * loaded by the parent and passed to the outlet contains a newer, fresher token,
   * and we don't find a match. We update the `find` logic to just perform a match
   * on the first (permanent) part of the ID.
   */
  const normalizedAddress = decodeURIComponent(addressId ?? '').split('?')[0];
  const address = addresses.find((address) =>
    address.id!.startsWith(normalizedAddress),
  );

  // It's not using the $id in the action - so it's unecessary atm!
  const path = usePrefixPathWithLocale(`/account/address/uselessId`);
  return (
    <>
      {!editMode && (
        <div>
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="border border-black uppercase py-2 px-10"
          >
            {addressId ? 'Edit address' : 'Add address'}
          </button>
        </div>
      )}

      {editMode && (
        <fetcher.Form className="w-full" method="post" action={path}>
          <input
            type="hidden"
            name="addressId"
            value={addressId ? addressId : 'add'}
          />
          {fetcher.data?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
              <p className="m-4 text-sm text-red-900">
                {fetcher.data?.formError}
              </p>
            </div>
          )}
          <div className="mt-3">
            <input
              className="w-full"
              id="firstName"
              name="firstName"
              required
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              defaultValue={address?.firstName ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="lastName"
              name="lastName"
              required
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={address?.lastName ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder="Company"
              aria-label="Company"
              defaultValue={address?.company ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="address1"
              name="address1"
              type="text"
              autoComplete="address-line1"
              placeholder="Address line 1*"
              required
              aria-label="Address line 1"
              defaultValue={address?.address1 ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="address2"
              name="address2"
              type="text"
              autoComplete="address-line2"
              placeholder="Address line 2"
              aria-label="Address line 2"
              defaultValue={address?.address2 ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="city"
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              placeholder="City"
              aria-label="City"
              defaultValue={address?.city ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="province"
              name="province"
              type="text"
              autoComplete="address-level1"
              placeholder="State / Province"
              required
              aria-label="State"
              defaultValue={address?.province ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="zip"
              name="zip"
              type="text"
              autoComplete="postal-code"
              placeholder="Zip / Postal Code"
              required
              aria-label="Zip"
              defaultValue={address?.zip ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="country"
              name="country"
              type="text"
              autoComplete="country-name"
              placeholder="Country"
              required
              aria-label="Country"
              defaultValue={address?.country ?? ''}
            />
          </div>
          <div className="mt-3">
            <input
              className="w-full"
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone"
              aria-label="Phone"
              defaultValue={address?.phone ?? ''}
            />
          </div>
          <div className="mt-4">
            <input
              type="checkbox"
              name="defaultAddress"
              id="defaultAddress"
              defaultChecked={defaultAddress?.id === address?.id}
              className="border-gray-500 rounded-sm cursor-pointer border-1"
            />
            <label
              className="inline-block ml-2 text-sm cursor-pointer"
              htmlFor="defaultAddress"
            >
              Set as default address
            </label>
          </div>
          <div className="mt-6 mb-4">
            <Button
              className="w-full rounded focus:shadow-outline"
              type="submit"
              variant="primary"
              disabled={transition.state !== 'idle'}
            >
              {transition.state !== 'idle' ? 'SAVING' : 'SAVE'}
            </Button>
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="border border-black uppercase py-2 px-10 w-full"
            >
              Cancel
            </button>
          </div>
        </fetcher.Form>
      )}
    </>
  );
}
