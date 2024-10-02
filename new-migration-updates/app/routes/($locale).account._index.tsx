import {LoaderFunctionArgs, redirect} from '@shopify/remix-oxygen';

export async function loader({request, context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const redirectTo = request.headers.get('Referer');

  return redirect(redirectTo || '/collections/new');
}
