import {
  redirect,
  json,
  type ActionFunction,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';

import {doLogin} from './($lang).account.login';
import type {CustomerCreatePayload} from '@shopify/hydrogen/storefront-api-types';

export async function loader({context, params}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `/${params.lang}/` : '/');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context, params}) => {
  const {session, storefront} = context;
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  try {
    const data = await storefront.mutate<{
      customerCreate: CustomerCreatePayload;
    }>(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {email, password},
      },
    });

    if (!data?.customerCreate?.customer?.id) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerCreate?.customerUserErrors.join(', '));
    }

    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    return json(
      {status: 'ok'},
      {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      },
    );
  } catch (error: any) {
    if (storefront.isApiError(error)) {
      return badRequest({
        formError: 'Something went wrong. Please try again later.',
      });
    }

    /**
     * The user did something wrong, but the raw error from the API is not super friendly.
     * Let's make one up.
     */
    return badRequest({
      formError:
        'Sorry. We could not create an account with this email. User might already exist, try to login instead.',
    });
  }
};

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
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
