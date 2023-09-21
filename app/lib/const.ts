export const PAGINATION_SIZE = 8;
export const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;
export const ATTR_LOADING_EAGER = 'eager';
export const USER_CONSENT_COOKIE_NAME = '_shopify_cookie_consent';
export const USER_CONSENT_COOKIE = `${USER_CONSENT_COOKIE_NAME}=1; path=/; sameSite=strict; secure=${
  process.env.NODE_ENV === 'production'
}; expires=${new Date(new Date().setFullYear(new Date().getFullYear() + 1))}`;

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
) {
  return index < maxEagerLoadCount ? ATTR_LOADING_EAGER : undefined;
}
