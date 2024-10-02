import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

// fallback wild card for all unauthenticated routes in account section
export async function loader({context, request}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const redirectTo = request.headers.get('Referer');

  return redirect(redirectTo || '/collections/new');
}
