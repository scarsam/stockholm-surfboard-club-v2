import {Params} from '@remix-run/react';
import {
  redirect,
  type ActionFunction,
  type AppLoadContext,
  type LoaderArgs,
  type ActionArgs,
} from '@shopify/remix-oxygen';

export async function doLogout(
  context: AppLoadContext,
  params: Params,
  request: Request,
) {
  const {session} = context;
  session.unset('customerAccessToken');

  const path = new URL(request.headers.get('referer') || '');
  const pathname = path.pathname;

  // The only file where I have to explicitly type cast i18n to pass typecheck
  return redirect(params.lang ? `/${params.lang}${pathname}` : pathname, {
    headers: {
      'Set-Cookie': await session.commit(),
    },
  });
}

export async function loader({request, params}: LoaderArgs) {
  const path = new URL(request.headers.get('referer') || '');
  const pathname = path.pathname;

  return redirect(params.lang ? `/${params.lang}${pathname}` : pathname);
}

export const action: ActionFunction = async ({
  context,
  params,
  request,
}: ActionArgs) => {
  return doLogout(context, params, request);
};
