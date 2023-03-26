import {
  json,
  redirect,
  type MetaFunction,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {Form, useActionData} from '@remix-run/react';
import {useState} from 'react';
import {Link} from '~/components';
import {getInputStyleClasses, usePrefixPathWithLocale} from '~/lib/utils';
import type {CustomerRecoverPayload} from '@shopify/hydrogen/storefront-api-types';

export async function loader({context, params}: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/` : '/');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
  resetRequested?: boolean;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return badRequest({
      formError: 'Please provide an email.',
    });
  }

  try {
    await context.storefront.mutate<{
      customerRecover: CustomerRecoverPayload;
    }>(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error: any) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};

export const meta: MetaFunction = () => {
  return {
    title: 'Recover Password',
  };
};

export function ResetPassword() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const isSubmitted = actionData?.resetRequested;

  const path = usePrefixPathWithLocale(`/account/recover`);

  return (
    <>
      {isSubmitted ? (
        <>
          <h1 className="text-4xl">Request Sent.</h1>
          <p className="mt-4">
            If that email address is in our system, you will receive an email
            with instructions about how to reset your password in a few minutes.
          </p>
        </>
      ) : (
        <>
          {/* TODO: Add onSubmit to validate _before_ submission with native? */}
          <Form method="post" action={path} noValidate className="w-full">
            {actionData?.formError && (
              <div className="flex items-center justify-center mb-6 bg-zinc-500">
                <p className="m-4 text-s text-contrast">
                  {actionData.formError}
                </p>
              </div>
            )}
            {/* <h1 className="text-xl">Forgot Password.</h1> */}
            <p className="mt-2 mb-4">
              Enter the email address associated with your account to receive a
              link to reset your password.
            </p>
            <div>
              <input
                className="w-full mb-6"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onBlur={(event) => {
                  setNativeEmailError(
                    event.currentTarget.value.length &&
                      !event.currentTarget.validity.valid
                      ? 'Invalid email address'
                      : null,
                  );
                }}
              />
              {nativeEmailError && (
                <p className="text-red-500 text-xs">
                  {nativeEmailError} &nbsp;
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="border border-black uppercase py-2 px-10 w-full"
                type="submit"
              >
                Request Reset Link
              </button>
            </div>
          </Form>
        </>
      )}
    </>
  );
}

const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
