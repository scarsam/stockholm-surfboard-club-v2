import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({params}: LoaderFunctionArgs) {
  return redirect(params?.lang ? `${params.lang}/products` : '/products');
}
