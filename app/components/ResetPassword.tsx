import {
  json,
  redirect,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen';
import {Form, useActionData, useFetcher} from '@remix-run/react';
import {useState} from 'react';
import {Link} from '~/components';
import {getInputStyleClasses, usePrefixPathWithLocale} from '~/lib/utils';
import type {CustomerRecoverPayload} from '@shopify/hydrogen/storefront-api-types';
import {type V2_MetaFunction} from '@remix-run/react';

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: 'Recover Password',
    },
  ];
};

export function ResetPassword() {
  const fetcher = useFetcher();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const isSubmitted = fetcher.data?.resetRequested;

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
          <fetcher.Form method="post" action={path} className="w-full">
            {fetcher.data?.formError && (
              <div className="flex items-center justify-center mb-6 bg-zinc-500">
                <p className="m-4 text-s text-contrast">
                  {fetcher.data?.formError}
                </p>
              </div>
            )}
            <p className="mt-2 mb-4">
              Enter the email address associated with your account to receive a
              link to reset your password.
            </p>
            <div>
              <input
                className="w-full mb-6 focus:border-black focus:outline-none ring-black focus:ring-black"
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
          </fetcher.Form>
        </>
      )}
    </>
  );
}
