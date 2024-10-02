import {Link} from '@remix-run/react';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

// SearchResults.Articles = SearchResultsArticles;
// SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

// Todo: Remove
// function SearchResultsArticles({
//   term,
//   articles,
// }: PartialSearchResult<'articles'>) {
//   if (!articles?.nodes.length) {
//     return null;
//   }

//   return (
//     <div className="search-result">
//       <h2>Articles</h2>
//       <div>
//         {articles?.nodes?.map((article) => {
//           const articleUrl = urlWithTrackingParams({
//             baseUrl: `/blogs/${article.handle}`,
//             trackingParams: article.trackingParameters,
//             term,
//           });

//           return (
//             <div className="search-results-item" key={article.id}>
//               <Link prefetch="intent" to={articleUrl}>
//                 {article.title}
//               </Link>
//             </div>
//           );
//         })}
//       </div>
//       <br />
//     </div>
//   );
// }

// function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
//   if (!pages?.nodes.length) {
//     return null;
//   }

//   return (
//     <div className="search-result">
//       <h2>Pages</h2>
//       <div>
//         {pages?.nodes?.map((page) => {
//           const pageUrl = urlWithTrackingParams({
//             baseUrl: `/pages/${page.handle}`,
//             trackingParams: page.trackingParameters,
//             term,
//           });

//           return (
//             <div className="search-results-item" key={page.id}>
//               <Link prefetch="intent" to={pageUrl}>
//                 {page.title}
//               </Link>
//             </div>
//           );
//         })}
//       </div>
//       <br />
//     </div>
//   );
// }

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            return (
              <div
                className="search-results-item flex flex-col"
                key={product.id}
              >
                <Link prefetch="intent" to={productUrl}>
                  {product.variants.nodes[0].image && (
                    <Image
                      className="aspect-[4/5] bg-primary/5"
                      data={product.variants.nodes[0].image}
                      alt={product.title}
                      width={'100%'}
                    />
                  )}
                  <div className="flex p-1 items-center justify-between">
                    <p>{product.title}</p>
                    <small>
                      <Money data={product.variants.nodes[0].price} />
                    </small>
                  </div>
                </Link>
              </div>
            );
          });

          return (
            <>
              <div>
                <PreviousLink>
                  {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                </PreviousLink>
              </div>
              <div className=" mt-4 grid-flow-row grid gap-1 md:gap-x-4 md:gap-y-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {ItemsMarkup}
              </div>
              <div className="flex justify-center mt-8">
                <NextLink className="inline-block font-medium text-center py-3 px-6 border ease-in-out duration-200 border border-primary/10 bg-contrast text-primary w-full bg-black text-white">
                  {isLoading ? 'Loading...' : <span>Load more products</span>}
                </NextLink>
              </div>
            </>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return <p>No results, try a different search.</p>;
}
