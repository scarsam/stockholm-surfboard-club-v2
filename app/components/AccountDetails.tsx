import {Form, useActionData, useFetcher, useTransition} from '@remix-run/react';
import type {Customer} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {Button, Link, Text} from '~/components';
import {usePrefixPathWithLocale} from '~/lib/utils';

export interface ActionData {
  success?: boolean;
  formError?: string;
  fieldErrors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    newPassword2?: string;
  };
}

export function AccountDetails({customer}: {customer: Customer}) {
  const fetcher = useFetcher();
  const transition = useTransition();
  const [editMode, setEditMode] = useState(false);
  const editStyle = editMode
    ? 'text-black text-[12px]'
    : 'p-0 border-0 text-black';

  useEffect(() => {
    if (fetcher.type === 'done') {
      setEditMode(false);
    }
  }, [fetcher.type]);

  const path = usePrefixPathWithLocale(`/account/edit`);
  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-col">
        <fetcher.Form className="flex-1" method="post" action={path}>
          <h3 className="font-bold text-lead mb-4">Personal infos</h3>

          {fetcher?.data?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
              <p className="m-4 text-sm text-red-900">
                {fetcher?.data?.formError}
              </p>
            </div>
          )}
          <div>
            <label
              className="flex flex-col text-sm gap-1 text-[#4D4D4D]"
              htmlFor="firstName"
            >
              First name
              <input
                disabled={!editMode}
                className={editStyle}
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                aria-label="First name"
                defaultValue={customer.firstName ?? ''}
              />
            </label>
            <div className="mt-3">
              <label
                className="flex flex-col text-sm gap-1 text-[#4D4D4D]"
                htmlFor="lastName"
              >
                Last name
                <input
                  disabled={!editMode}
                  className={editStyle}
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Last name"
                  aria-label="Last name"
                  defaultValue={customer.lastName ?? ''}
                />
              </label>
            </div>
          </div>
          <div className="mt-3">
            <label
              className="flex flex-col text-sm gap-1 text-[#4D4D4D]"
              htmlFor="email"
            >
              E-mail address
              <input
                disabled={!editMode}
                className={editStyle}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address"
                aria-label="Email address"
                defaultValue={customer.email ?? ''}
              />
              {fetcher?.data?.fieldErrors?.email && (
                <p className="text-red-500 text-xs">
                  {fetcher?.data.fieldErrors.email} &nbsp;
                </p>
              )}
            </label>
          </div>
          {editMode ? (
            <>
              <Password
                editMode={editMode}
                name="currentPassword"
                label="Current password"
                passwordError={fetcher?.data?.fieldErrors?.currentPassword}
              />
              {fetcher?.data?.fieldErrors?.currentPassword && (
                <Text size="fine" className="mt-1 text-red-500">
                  {fetcher?.data.fieldErrors.currentPassword} &nbsp;
                </Text>
              )}
              <Password
                editMode={editMode}
                name="newPassword"
                label="New password"
                passwordError={fetcher?.data?.fieldErrors?.newPassword}
              />
              <Password
                editMode={editMode}
                name="newPassword2"
                label="Re-enter new password"
                passwordError={fetcher?.data?.fieldErrors?.newPassword2}
              />
              <Text
                size="fine"
                color="subtle"
                className={clsx(
                  'mt-1',
                  fetcher?.data?.fieldErrors?.newPassword && 'text-red-500',
                )}
              >
                Passwords must be at least 8 characters.
              </Text>
              {fetcher?.data?.fieldErrors?.newPassword2 ? <br /> : null}
              {fetcher?.data?.fieldErrors?.newPassword2 && (
                <Text size="fine" className="mt-1 text-red-500">
                  {fetcher?.data?.fieldErrors.newPassword2} &nbsp;
                </Text>
              )}
            </>
          ) : (
            <div className="mt-3">
              <label
                className="flex flex-col text-sm gap-1 text-[#4D4D4D]"
                htmlFor="password"
              >
                Password
                <input
                  disabled={!editMode}
                  className={editStyle}
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  aria-label="Password"
                  defaultValue="******************"
                />
              </label>
            </div>
          )}
          {editMode ? (
            <>
              <div className="mt-6">
                <Button
                  className="border border-black uppercase py-2 px-10 w-full mb-2"
                  variant="primary"
                  width="full"
                  type="submit"
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
            </>
          ) : (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="border border-black uppercase py-2 px-10"
              >
                Edit Profile
              </button>
            </div>
          )}
        </fetcher.Form>
      </div>
    </div>
  );
}

function Password({
  name,
  passwordError,
  label,
  editMode,
}: {
  name: string;
  passwordError?: string;
  label: string;
  editMode: boolean;
}) {
  const editStyle = editMode ? 'w-full text-[12px]' : 'w-full';

  return (
    <div className="mt-3">
      <label
        className="flex flex-col text-sm gap-1 text-[#4D4D4D]"
        htmlFor={name}
      >
        {label}
        <input
          className={editStyle}
          id={name}
          name={name}
          type="password"
          autoComplete={
            name === 'currentPassword' ? 'current-password' : undefined
          }
          placeholder={label}
          aria-label={label}
          minLength={8}
        />
      </label>
    </div>
  );
}

// const CUSTOMER_UPDATE_MUTATION = `#graphql
//   mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
//     customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
//       customerUserErrors {
//         code
//         field
//         message
//       }
//     }
//   }
//   `;
