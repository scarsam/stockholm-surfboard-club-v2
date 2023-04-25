import {Form, useActionData, useFetcher} from '@remix-run/react';
import {useState} from 'react';
import {usePrefixPathWithLocale} from '~/lib/utils';

export function CreateAccount() {
  const fetcher = useFetcher();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );
  const path = usePrefixPathWithLocale(`/account/register`);

  return (
    <fetcher.Form method="post" action={path} className="w-full">
      {fetcher?.data?.formError && (
        <div className="flex items-center justify-center mb-6 bg-zinc-500">
          <p className="m-4 text-s text-contrast">{fetcher?.data.formError}</p>
        </div>
      )}
      <div className="mb-2">
        <input
          className="w-full focus:border-black focus:outline-none ring-black focus:ring-black"
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
          <p className="text-red-500 text-xs">{nativeEmailError} &nbsp;</p>
        )}
      </div>
      <div className="mb-6">
        <input
          className="w-full focus:border-black focus:outline-none ring-black focus:ring-black"
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
          <p className="text-red-500 text-xs"> {nativePasswordError} &nbsp;</p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <button
          disabled={Boolean(nativeEmailError) || Boolean(nativePasswordError)}
          className="border border-black uppercase py-2 px-10 w-full"
          type="submit"
        >
          Create Account
        </button>
      </div>
    </fetcher.Form>
  );
}
