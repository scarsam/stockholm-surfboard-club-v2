import {
  json,
  redirect,
  type ActionFunction,
  type AppLoadContext,
} from '@shopify/remix-oxygen';
import type {CustomerAccessTokenCreatePayload} from '@shopify/hydrogen/storefront-api-types';
// import Homepage from '~/routes/($lang)/($lang).index';
import {type MetaFunction} from '@remix-run/react';

export const handle = {
  isPublic: true,
};

// export async function loader({context, params, request}: LoaderFunctionArgs) {
//   const customerAccessToken = await context.session.get('customerAccessToken');

//   if (customerAccessToken) {
//     return redirect(
//       params.lang ? `${params.lang}/collections/sale` : '/collections/sale',
//     );
//   }

//   const url = new URL(request.url);
//   const pathname = url.pathname;
//   const hasError = url.searchParams.get('formError');

//   if (hasError) return json({shopName: 'Stockholm Surfboard Club'});

//   return redirect(params.lang ? `${params.lang}/${pathname}` : `${pathname}`);
// }

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context, params}) => {
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

  const {session, storefront} = context;

  try {
    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    const path = new URL(request.headers.get('referer') || '');
    const pathname = path.pathname;

    return redirect(params.lang ? `/${params.lang}${pathname}` : pathname, {
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
      formError:
        'Sorry. We did not recognize either your email or password. Please try to sign in again or create a new account.',
    });
  }
};

export const shouldRevalidate = () => {
  return false;
};

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Login',
    },
  ];
};

export default () => {};

// export default function Login() {
//   const {shopName} = useLoaderData<typeof loader>();
//   const actionData = useActionData<ActionData>();
//   const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
//   const [nativePasswordError, setNativePasswordError] = useState<null | string>(
//     null,
//   );

//   return (
//     <div className="flex justify-center my-24 px-4">
//       <div className="max-w-md w-full">
//         <h1 className="text-4xl">Sign in.</h1>
//         {/* TODO: Add onSubmit to validate _before_ submission with native? */}
//         <Form
//           method="POST"
//           noValidate
//           className="pt-6 pb-8 mt-4 mb-4 space-y-3"
//         >
//           {actionData?.formError && (
//             <div className="flex items-center justify-center mb-6 bg-zinc-500">
//               <p className="m-4 text-s text-contrast">{actionData.formError}</p>
//             </div>
//           )}
//           <div>
//             <input
//               className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
//               id="email"
//               name="email"
//               type="email"
//               autoComplete="email"
//               required
//               placeholder="Email address"
//               aria-label="Email address"
//               // eslint-disable-next-line jsx-a11y/no-autofocus
//               autoFocus
//               onBlur={(event) => {
//                 setNativeEmailError(
//                   event.currentTarget.value.length &&
//                     !event.currentTarget.validity.valid
//                     ? 'Invalid email address'
//                     : null,
//                 );
//               }}
//             />
//             {nativeEmailError && (
//               <p className="text-red-500 text-xs">{nativeEmailError} &nbsp;</p>
//             )}
//           </div>

//           <div>
//             <input
//               className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
//               id="password"
//               name="password"
//               type="password"
//               autoComplete="current-password"
//               placeholder="Password"
//               aria-label="Password"
//               minLength={8}
//               required
//               // eslint-disable-next-line jsx-a11y/no-autofocus
//               autoFocus
//               onBlur={(event) => {
//                 if (
//                   event.currentTarget.validity.valid ||
//                   !event.currentTarget.value.length
//                 ) {
//                   setNativePasswordError(null);
//                 } else {
//                   setNativePasswordError(
//                     event.currentTarget.validity.valueMissing
//                       ? 'Please enter a password'
//                       : 'Passwords must be at least 8 characters',
//                   );
//                 }
//               }}
//             />
//             {nativePasswordError && (
//               <p className="text-red-500 text-xs">
//                 {' '}
//                 {nativePasswordError} &nbsp;
//               </p>
//             )}
//           </div>
//           <div className="flex items-center justify-between">
//             <button
//               className="bg-primary text-contrast rounded py-2 px-4 focus:shadow-outline block w-full"
//               type="submit"
//             >
//               Sign in
//             </button>
//           </div>
//           <div className="flex justify-between items-center mt-8 border-t border-gray-300">
//             <p className="align-baseline text-sm mt-6">
//               New to {shopName}? &nbsp;
//               <Link className="inline underline" to="/account/register">
//                 Create an account
//               </Link>
//             </p>
//             <Link
//               className="mt-6 inline-block align-baseline text-sm text-primary/50"
//               to="/account/recover"
//             >
//               Forgot password
//             </Link>
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// }

const LOGIN_MUTATION = `#graphql
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

export async function doLogin(
  {storefront}: AppLoadContext,
  {
    email,
    password,
  }: {
    email: string;
    password: string;
  },
) {
  const data = await storefront.mutate<{
    customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
  }>(LOGIN_MUTATION, {
    variables: {
      input: {
        email,
        password,
      },
    },
  });

  if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
    return data.customerAccessTokenCreate.customerAccessToken.accessToken;
  }

  /**
   * Something is wrong with the user's input.
   */
  throw new Error(
    data?.customerAccessTokenCreate?.customerUserErrors.join(', '),
  );
}
