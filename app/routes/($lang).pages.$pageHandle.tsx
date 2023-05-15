import {json, type LoaderArgs} from '@shopify/remix-oxygen';
import type {Page as PageType} from '@shopify/hydrogen/storefront-api-types';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import type {SeoHandleFunction} from '@shopify/hydrogen';
import clsx from 'clsx';

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

const BG_PAGES = ['about', 'store'];

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  const pageTite = page.title.toLowerCase();
  const isBgPage = BG_PAGES.some((page) => page === pageTite);

  return (
    <div
      className={clsx('flex-grow flex-col md:flex-row flex-col-reverse', {
        ['flex']: isBgPage,
      })}
    >
      <div
        className={clsx('md:flex-1 p-6 min-h-[300px] md:min-h-[unset]', {
          ['max-w-[1000px] m-auto border-x']: !isBgPage,
        })}
      >
        <div className="flex h-full md:items-center justify-center">
          <div dangerouslySetInnerHTML={{__html: page.body}} />
        </div>
      </div>
      {isBgPage ? (
        <>
          <div className={`bg-${pageTite} flex-1 bg-no-repeat bg-cover`} />
          <div className="hidden bg-store bg-about"></div>
        </>
      ) : null}
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
