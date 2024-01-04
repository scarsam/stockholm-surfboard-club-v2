import {json, type ActionFunction} from '@shopify/remix-oxygen';

import type {
  MailingAddressInput,
  CustomerAddressUpdatePayload,
  CustomerAddressDeletePayload,
  CustomerDefaultAddressUpdatePayload,
  CustomerAddressCreatePayload,
} from '@shopify/hydrogen/storefront-api-types';
import invariant from 'tiny-invariant';
import {assertApiErrors} from '~/lib/utils';
import {getCustomer} from '../components/Account';

interface ActionData {
  formError?: string;
}

const badRequest = (data: ActionData) => json(data, {status: 400});

export const handle = {
  renderInModal: true,
};
// export const handle = {
//   renderInModal: true,
// };

// export async function loader({context, params}: LoaderArgs) {
//   const customerAccessToken = await context.session.get('customerAccessToken');

//   if (customerAccessToken) {
//     return redirect(
//       params.lang ? `${params.lang}/collections/sale` : '/collections/sale',
//     );
//   }

//   return new Response(null);
// }

export const action: ActionFunction = async ({request, params, context}) => {
  const {storefront, session} = context;
  const formData = await request.formData();

  const customerAccessToken = await session.get('customerAccessToken');
  invariant(customerAccessToken, 'You must be logged in to edit your account.');

  const addressId = formData.get('addressId');
  invariant(typeof addressId === 'string', 'You must provide an address id.');

  await getCustomer(context, customerAccessToken, params, request);

  if (request.method === 'DELETE') {
    try {
      const data = await storefront.mutate<{
        customerAddressDelete: CustomerAddressDeletePayload;
      }>(DELETE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, id: addressId},
      });

      assertApiErrors(data.customerAddressDelete);
      // return redirect(params.lang ? `${params.lang}/${pathname}` : pathname);
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  }

  const address: MailingAddressInput = {};

  const keys: (keyof MailingAddressInput)[] = [
    'lastName',
    'firstName',
    'address1',
    'address2',
    'city',
    'province',
    'country',
    'zip',
    'phone',
    'company',
  ];

  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      address[key] = value;
    }
  }

  const defaultAddress = formData.get('defaultAddress');

  if (addressId === 'add') {
    try {
      const data = await storefront.mutate<{
        customerAddressCreate: CustomerAddressCreatePayload;
      }>(CREATE_ADDRESS_MUTATION, {
        variables: {customerAccessToken, address},
      });

      assertApiErrors(data.customerAddressCreate);

      const newId = data.customerAddressCreate?.customerAddress?.id;
      invariant(newId, 'Expected customer address to be created');

      if (defaultAddress) {
        const data = await storefront.mutate<{
          customerDefaultAddressUpdate: CustomerDefaultAddressUpdatePayload;
        }>(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {customerAccessToken, addressId: newId},
        });

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return json({error: null, ok: true});
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  } else {
    try {
      const data = await storefront.mutate<{
        customerAddressUpdate: CustomerAddressUpdatePayload;
      }>(UPDATE_ADDRESS_MUTATION, {
        variables: {
          address,
          customerAccessToken,
          id: decodeURIComponent(addressId),
        },
      });

      assertApiErrors(data.customerAddressUpdate);

      if (defaultAddress) {
        const data = await storefront.mutate<{
          customerDefaultAddressUpdate: CustomerDefaultAddressUpdatePayload;
        }>(UPDATE_DEFAULT_ADDRESS_MUTATION, {
          variables: {
            customerAccessToken,
            addressId: decodeURIComponent(addressId),
          },
        });

        assertApiErrors(data.customerDefaultAddressUpdate);
      }

      return json({error: null, ok: true});
    } catch (error: any) {
      return badRequest({formError: error.message});
    }
  }
};

const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
    $id: ID!
  ) {
    customerAddressUpdate(
      address: $address
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      customerUserErrors {
        code
        field
        message
      }
      deletedCustomerAddressId
    }
  }
`;

const UPDATE_DEFAULT_ADDRESS_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate(
    $addressId: ID!
    $customerAccessToken: String!
  ) {
    customerDefaultAddressUpdate(
      addressId: $addressId
      customerAccessToken: $customerAccessToken
    ) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
  ) {
    customerAddressCreate(
      address: $address
      customerAccessToken: $customerAccessToken
    ) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
