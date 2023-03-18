import {Form, useActionData, useTransition} from '@remix-run/react';
import type {Customer} from '@shopify/hydrogen/storefront-api-types';
import clsx from 'clsx';
import {useState} from 'react';
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
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const [editMode, setEditMode] = useState(false);
  const editStyle = editMode ? '' : 'p-0 border-0';

  const path = usePrefixPathWithLocale(`/account/edit`);
  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-col">
        <Form className="flex-1" method="post" action={path}>
          <h3 className="font-bold text-lead mb-4">Personal infos</h3>

          {actionData?.formError && (
            <div className="flex items-center justify-center mb-6 bg-red-100 rounded">
              <p className="m-4 text-sm text-red-900">{actionData.formError}</p>
            </div>
          )}
          <div>
            <label className="flex flex-col text-sm gap-1" htmlFor="firstName">
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
          </div>
          <div className="mt-3">
            <label className="flex flex-col text-sm gap-1" htmlFor="lastName">
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
          <div className="mt-3">
            <label className="flex flex-col text-sm gap-1" htmlFor="email">
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
              {actionData?.fieldErrors?.email && (
                <p className="text-red-500 text-xs">
                  {actionData.fieldErrors.email} &nbsp;
                </p>
              )}
            </label>
          </div>
          {editMode ? (
            <>
              <Password
                name="currentPassword"
                label="Current password"
                passwordError={actionData?.fieldErrors?.currentPassword}
              />
              {actionData?.fieldErrors?.currentPassword && (
                <Text size="fine" className="mt-1 text-red-500">
                  {actionData.fieldErrors.currentPassword} &nbsp;
                </Text>
              )}
              <Password
                name="newPassword"
                label="New password"
                passwordError={actionData?.fieldErrors?.newPassword}
              />
              <Password
                name="newPassword2"
                label="Re-enter new password"
                passwordError={actionData?.fieldErrors?.newPassword2}
              />
              <Text
                size="fine"
                color="subtle"
                className={clsx(
                  'mt-1',
                  actionData?.fieldErrors?.newPassword && 'text-red-500',
                )}
              >
                Passwords must be at least 8 characters.
              </Text>
              {actionData?.fieldErrors?.newPassword2 ? <br /> : null}
              {actionData?.fieldErrors?.newPassword2 && (
                <Text size="fine" className="mt-1 text-red-500">
                  {actionData.fieldErrors.newPassword2} &nbsp;
                </Text>
              )}
            </>
          ) : (
            <div className="mt-3">
              <label className="flex flex-col text-sm gap-1" htmlFor="password">
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
                  {transition.state !== 'idle' ? 'Saving' : 'Save'}
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
        </Form>
      </div>
    </div>
  );
}

function Password({
  name,
  passwordError,
  label,
}: {
  name: string;
  passwordError?: string;
  label: string;
}) {
  return (
    <div className="mt-3">
      <label className="flex flex-col text-sm gap-1" htmlFor={name}>
        {label}
        <input
          className="w-full"
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

const CUSTOMER_UPDATE_MUTATION = `#graphql
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;
