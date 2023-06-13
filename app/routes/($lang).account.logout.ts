import {Params} from '@remix-run/react';
import {
  // redirect,
  type ActionFunction,
  type AppLoadContext,
  type LoaderArgs,
  type ActionArgs,
  json,
} from '@shopify/remix-oxygen';

export async function doLogout(context: AppLoadContext, params: Params) {
  const {session} = context;
  session.unset('customerAccessToken');

  // The only file where I have to explicitly type cast i18n to pass typecheck
  return json(
    {status: 'ok'},
    {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    },
  );
}

export async function loader({params}: LoaderArgs) {
  return json({status: 'ok'});
  // return redirect(`${params.lang}/collections/new`);
}

export const action: ActionFunction = async ({context, params}: ActionArgs) => {
  return doLogout(context, params);
};
