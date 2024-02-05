# Hydrogen upgrade guide: 2023.10.2 to 2024.1.0

----

## Features

### Update the GraphQL config in .graphqlrc.yml to use the more modern projects structure: [#1577](https://github.com/Shopify/hydrogen/pull/1577)

#### Step: 1. This allows you to add additional projects to the GraphQL config, such as third party CMS schemas. [#1577](https://github.com/Shopify/hydrogen/pull/1577)

[#1577](https://github.com/Shopify/hydrogen/pull/1577)
```diff
-schema: node_modules/@shopify/hydrogen/storefront.schema.json
+projects:
+ default:
+    schema: 'node_modules/@shopify/hydrogen/storefront.schema.json
```

#### Step: 2. Also, you can modify the document paths used for the Storefront API queries. This is useful if you have a large codebase and want to exclude certain files from being used for codegen or other GraphQL utilities: [#1577](https://github.com/Shopify/hydrogen/pull/1577)

[#1577](https://github.com/Shopify/hydrogen/pull/1577)
 ```yaml
    projects:
      default:
        schema: 'node_modules/@shopify/hydrogen/storefront.schema.json'
        documents:
          - '!*.d.ts'
          - '*.{ts,tsx,js,jsx}'
          - 'app/**/*.{ts,tsx,js,jsx}'
    ```

### Use new `variantBySelectedOptions` parameters introduced in Storefront API v2024-01 to fix redirection to the product's default variant when there are unknown query params in the URL. [#1642](https://github.com/Shopify/hydrogen/pull/1642)

#### Update the `product` query to include the `variantBySelectedOptions` parameters `ignoreUnknownOptions` and `caseInsensitiveMatch`
[#1642](https://github.com/Shopify/hydrogen/pull/1642)
```diff
-   selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
+   selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
```

### Better Hydrogen error handling [#1645](https://github.com/Shopify/hydrogen/pull/1645)

#### Changed the shape of the error objects returned by createCartHandler. Previously, mutations could return an errors array that contained a userErrors array. With this change, these arrays are no longer nested. The response can contain both an errors array and a userErrors array. errors contains GraphQL execution errors. userErrors contains errors caused by the cart mutation itself (such as adding a product that has zero inventory). storefront.isApiError is deprecated.
[#1645](https://github.com/Shopify/hydrogen/pull/1645)
```diff
- const data = await context.storefront.query(EXAMPLE_QUERY)
+ const {data, errors, userErrors} = await context.storefront.query(EXAMPLE_QUERY) 
```

```diff
- const cart = await context.cart.get()
+ const {cart, errors, userErrors} = await context.cart.get()
```

### Add deploy command to Hydrogen CLI [#1628](https://github.com/Shopify/hydrogen/pull/1628)

#### Use the new `h2 deploy` command to deploy your app
[#1628](https://github.com/Shopify/hydrogen/pull/1628)
```bash
npx shopify hydrogen deploy --help
```

### Add `--template` flag to enable scaffolding projects based on examples from the Hydrogen repo [#1608](https://github.com/Shopify/hydrogen/pull/1608)

#### Use the new `--template` flag to scaffold your app
[#1608](https://github.com/Shopify/hydrogen/pull/1608)
```bash
npm create @shopify/hydrogen@latest -- --template multipass
```

### Make the worker runtime the default environment for the local dev and preview. [#1625](https://github.com/Shopify/hydrogen/pull/1625)

#### To access the legacy Node.js runtime, pass the --legacy-runtime flag. The legacy runtime will be deprecated and removed in a future release.
[#1625](https://github.com/Shopify/hydrogen/pull/1625)
```diff
"scripts": {
-   "dev": "shopify hydrogen dev --codegen",
+   "dev": "shopify hydrogen dev --codegen --legacy-runtime",
-    "preview": "npm run build && shopify hydrogen preview",
+    "preview": "npm run build && shopify hydrogen preview --legacy-runtime",
}
```

### Make default HydrogenSession type extensible [#1590](https://github.com/Shopify/hydrogen/pull/1590)

#### New HydrogenSession type
[#1590](https://github.com/Shopify/hydrogen/pull/1590)
```diff
import {
+ type HydrogenSession,
} from '@shopify/hydrogen';

- class HydrogenSession {
+ class AppSession implements HydrogenSession {
    ...
}
```

### New `h2 upgrade` command [#1458](https://github.com/Shopify/hydrogen/pull/1458)

#### Step: 1. Try the upgrade command via [#1458](https://github.com/Shopify/hydrogen/pull/1458)

[docs](https://shopify.dev/docs/custom-storefronts/hydrogen/cli#upgrade)
[#1458](https://github.com/Shopify/hydrogen/pull/1458)
```bash
# from the base of the project run
h2 upgrade
```

#### Step: 2. Upgrade to a specific Hydrogen version with the --version flag [#1458](https://github.com/Shopify/hydrogen/pull/1458)

[docs](https://shopify.dev/docs/custom-storefronts/hydrogen/cli#upgrade)
[#1458](https://github.com/Shopify/hydrogen/pull/1458)
```bash
h2 upgrade --version 2023.10.3
```

### Enable debugger connections by passing `--debug` flag to the `h2 dev` command [#1480](https://github.com/Shopify/hydrogen/pull/1480)

#### Step: 1. Debugging on the default runtime (Node.js sandbox): [#1480](https://github.com/Shopify/hydrogen/pull/1480)

[#1480](https://github.com/Shopify/hydrogen/pull/1480)
```bash
h2 dev --debug
```

#### Step: 2. Debugging on the new worker runtime: [#1480](https://github.com/Shopify/hydrogen/pull/1480)

[#1480](https://github.com/Shopify/hydrogen/pull/1480)
```bash
h2 dev --debug --worker-unstable
```

### Added an optional prop to the `ShopPayButton` to enable order attribution support for either the Headless or Hydrogen sales channel. [#1447](https://github.com/Shopify/hydrogen/pull/1447)

#### Customize the order attribution via the `channel` prop
[#1447](https://github.com/Shopify/hydrogen/pull/1447)
```diff
<ShopPayButton
    variantIds={[variantId]}
    storeDomain={storeDomain}
+  channel="headless || hydrogen"
/>
```

----

----

## Fixes

### Use new `variantBySelectedOptions` parameters introduced in Storefront API v2024-01 to fix redirection to the product's default variant when there are unknown query params in the URL. [#1642](https://github.com/Shopify/hydrogen/pull/1642)

#### Update the `product` query to include the `variantBySelectedOptions` parameters `ignoreUnknownOptions` and `caseInsensitiveMatch`
[#1642](https://github.com/Shopify/hydrogen/pull/1642)
```diff
-   selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
+   selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
```

### In TypeScript projects, when updating to the latest `@shopify/remix-oxygen` adapter release, please update also to the latest version of `@shopify/oxygen-workers-types` [#1494](https://github.com/Shopify/hydrogen/pull/1494)

#### Upgrade @shopify/oxygen-workers-types dependency
[#1494](https://github.com/Shopify/hydrogen/pull/1494)
```diff
"devDependencies": {
  "@remix-run/dev": "2.1.0",
  "@remix-run/eslint-config": "2.1.0",
- "@shopify/oxygen-workers-types": "^3.17.3",
+ "@shopify/oxygen-workers-types": "^4.0.0",
  "@shopify/prettier-config": "^1.1.2",
  ...
},
```

### Updated internal dependencies for bug resolution [#1496](https://github.com/Shopify/hydrogen/pull/1496)

#### Update the `@shopify/cli` dependency in your app to avoid duplicated subdependencies:
[#1496](https://github.com/Shopify/hydrogen/pull/1496)
```diff
  "dependencies": {
-   "@shopify/cli": "3.50.2",
+   "@shopify/cli": "3.51.0",
  }
```

### Add `@remix-run/server-runtime` as a dev dependency.  [#1489](https://github.com/Shopify/hydrogen/pull/1489)

#### Since Remix is now a peer dependency of `@shopify/remix-oxygen`, you need to add `@remix-run/server-runtime` to your dependencies with the same version you have for the rest of Remix dependencies
[#1489](https://github.com/Shopify/hydrogen/pull/1489)
```diff
"dependencies": {
  "@remix-run/react": "2.1.0"
+ "@remix-run/server-runtime": "2.1.0"
  ...
}
```
