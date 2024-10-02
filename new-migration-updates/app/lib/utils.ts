import {type Locale, countries} from '~/data/countries';

export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);

  switch (url.host) {
    case 'ca.hydrogen.shop':
      if (/^\/fr($|\/)/.test(url.pathname)) {
        return countries['fr-ca'];
      } else {
        return countries['en-ca'];
      }
      break;
    case 'hydrogen.au':
      return countries['en-au'];
      break;
    default:
      return countries['default'];
  }
}
