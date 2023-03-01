import {Form, Link, useActionData} from '@remix-run/react';
import {QueryRoot} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';
import {getInputStyleClasses} from '~/lib/utils';

type ActionData = {
  formError?: string;
};

export function Login({name}: {name: string}) {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <Form action="/?index" method="post" noValidate className="p-2 w-full">
      {actionData?.formError && (
        <div className="flex items-center justify-center mb-6 bg-zinc-500">
          <p className="m-4 text-s text-contrast">{actionData.formError}</p>
        </div>
      )}
      <h2 className="text-xl mb-4">Sign in.</h2>
      <div className="mb-2">
        <input
          className="w-full"
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
          className="w-full"
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
          className="border border-black uppercase py-2 px-10 w-full"
          type="submit"
        >
          Sign in
        </button>
      </div>
    </Form>
  );
}
