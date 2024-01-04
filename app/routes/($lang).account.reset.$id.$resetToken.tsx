import {json, redirect, type ActionFunction} from '@shopify/remix-oxygen';
import {Form, useActionData} from '@remix-run/react';
import {useRef, useState} from 'react';
import {getInputStyleClasses} from '~/lib/utils';
import type {CustomerResetPayload} from '@shopify/hydrogen/storefront-api-types';
import {type V2_MetaFunction} from '@remix-run/react';

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({
  request,
  context,
  params: {lang, id, resetToken},
}) => {
  if (
    !id ||
    !resetToken ||
    typeof id !== 'string' ||
    typeof resetToken !== 'string'
  ) {
    return badRequest({
      formError: 'Wrong token. Please try to reset your password again.',
    });
  }

  const formData = await request.formData();

  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');

  if (
    !password ||
    !passwordConfirm ||
    typeof password !== 'string' ||
    typeof passwordConfirm !== 'string' ||
    password !== passwordConfirm
  ) {
    return badRequest({
      formError: 'Please provide matching passwords',
    });
  }

  const {session, storefront} = context;

  try {
    const data = await storefront.mutate<{customerReset: CustomerResetPayload}>(
      CUSTOMER_RESET_MUTATION,
      {
        variables: {
          id: `gid://shopify/Customer/${id}`,
          input: {
            password,
            resetToken,
          },
        },
      },
    );

    const {accessToken} = data?.customerReset?.customerAccessToken ?? {};

    if (!accessToken) {
      /**
       * Something is wrong with the user's input.
       */
      throw new Error(data?.customerReset?.customerUserErrors.join(', '));
    }

    session.set('customerAccessToken', accessToken);

    return redirect(lang ? `/${lang}/collections/sale` : '/collections/sale', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
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
      formError: 'Sorry. We could not update your password.',
    });
  }
};

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: 'Reset Password',
    },
  ];
};

export default function Reset() {
  const actionData = useActionData<ActionData>();
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );
  const [nativePasswordConfirmError, setNativePasswordConfirmError] = useState<
    null | string
  >(null);

  const passwordInput = useRef<HTMLInputElement>(null);
  const passwordConfirmInput = useRef<HTMLInputElement>(null);

  const validatePasswordConfirm = () => {
    if (!passwordConfirmInput.current) return;

    if (
      passwordConfirmInput.current.value.length &&
      passwordConfirmInput.current.value !== passwordInput.current?.value
    ) {
      setNativePasswordConfirmError('The two passwords entered did not match.');
    } else if (
      passwordConfirmInput.current.validity.valid ||
      !passwordConfirmInput.current.value.length
    ) {
      setNativePasswordConfirmError(null);
    } else {
      setNativePasswordConfirmError(
        passwordConfirmInput.current.validity.valueMissing
          ? 'Please re-enter the password'
          : 'Passwords must be at least 8 characters',
      );
    }
  };

  return (
    <div className="flex justify-center my-24 px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl">Reset Password.</h1>
        <p className="mt-2">Enter a new password for your account.</p>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="POST"
          noValidate
          className="pt-6 pb-8 mt-4 mb-4 space-y-3"
        >
          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-zinc-500">
              <p className="m-4 text-s text-contrast">{actionData.formError}</p>
            </div>
          )}
          <div className="mb-3">
            <input
              ref={passwordInput}
              className="w-full mb-3 focus:border-black focus:outline-none ring-black focus:ring-black"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              aria-label="Password"
              minLength={8}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativePasswordError(null);
                  validatePasswordConfirm();
                } else {
                  setNativePasswordError(
                    event.currentTarget.validity.valueMissing
                      ? 'Please enter a password'
                      : 'Passwords must be at least 8 characters',
                  );
                }
              }}
            />
            {nativePasswordError && (
              <p className="text-red-500 text-xs">
                {' '}
                {nativePasswordError} &nbsp;
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              ref={passwordConfirmInput}
              className="w-full mb-6 focus:border-black focus:outline-none ring-black focus:ring-black"
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="current-password"
              placeholder="Re-enter password"
              aria-label="Re-enter password"
              minLength={8}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={validatePasswordConfirm}
            />
            {nativePasswordConfirmError && (
              <p className="text-red-500 text-xs">
                {' '}
                {nativePasswordConfirmError} &nbsp;
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="border border-black uppercase py-2 px-10 w-full"
              type="submit"
            >
              Save
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

const CUSTOMER_RESET_MUTATION = `#graphql
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
