import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import type {Page as PageType} from '@shopify/hydrogen/storefront-api-types';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import type {SeoHandleFunction} from '@shopify/hydrogen';

const seo: SeoHandleFunction<typeof loader> = ({data}) => ({
  title: data?.page?.seo?.title,
  description: data?.page?.seo?.description,
});

export const handle = {
  seo,
};

export async function loader({request, params, context}: LoaderArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await context.storefront.query<{page: PageType}>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
      language: context.storefront.i18n.language,
    },
  });

  if (!page) {
    throw new Response(null, {status: 404});
  }

  return json(
    {page},
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-grow flex-col md:flex-row flex-col-reverse">
      <div className="md:flex-1 p-6 min-h-[300px] md:min-h-[unset]">
        <div className="flex h-full md:items-center justify-center">
          <div dangerouslySetInnerHTML={{__html: page.body}} />
        </div>
      </div>
      <div
        className={`bg-${page.title.toLowerCase()} flex-1 bg-no-repeat bg-cover`}
      />
      <div className="d-none bg-store bg-about"></div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;
