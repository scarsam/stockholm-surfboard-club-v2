import {Form, Link, useActionData} from '@remix-run/react';
import {QueryRoot} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';
import {getInputStyleClasses} from '~/lib/utils';

type ActionData = {
  formError?: string;
};

export function Login({shop}: {shop: QueryRoot['shop']}) {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <Form
      action="/?index"
      method="post"
      noValidate
      className="pt-6 pb-8 mt-4 mb-4 space-y-3"
    >
      {actionData?.formError && (
        <div className="flex items-center justify-center mb-6 bg-zinc-500">
          <p className="m-4 text-s text-contrast">{actionData.formError}</p>
        </div>
      )}
      <div>
        <input
          className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
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

      <div>
        <input
          className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
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
          className="bg-primary text-contrast rounded py-2 px-4 focus:shadow-outline block w-full"
          type="submit"
        >
          Sign in
        </button>
      </div>
      <div className="flex justify-between items-center mt-8 border-t border-gray-300">
        <p className="align-baseline text-sm mt-6">
          New to {shop.name}? &nbsp;
          <Link className="inline underline" to="/account/register">
            Create an account
          </Link>
        </p>
        <Link
          className="mt-6 inline-block align-baseline text-sm text-primary/50"
          to="/account/recover"
        >
          Forgot password
        </Link>
      </div>
    </Form>
  );
}
