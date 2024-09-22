import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    optimizeDeps: {
      include: [
        'use-sync-external-store/shim/with-selector.js',
        '@remix-run/dev/server-build',
        'ts-easing',
        'fast-shallow-equal',
        'screenfull',
        'render',
        'react-universal-interface',
        'ts-easing',
        'nano-css/addon/vcssom/cssToTree',
        'nano-css/addon/vcssom',
        'nano-css/addon/cssom',
        'nano-css',
        'copy-to-clipboard',
        'js-cookie',
        'fast-deep-equal/react',
        'typographic-base',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react-universal-interface',
      'clsx',
      '@headlessui/react',
      'typographic-base',
      'react-intersection-observer',
      'react-use/esm/useScroll',
      'react-use/esm/useLocation',
      'react-use/esm/useScratch',
      'react-use/esm/useHarmonicIntervalFn',
      'react-use/esm/useDebounce',
      'react-use/esm/useWindowScroll',
    ],
  },
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
});
