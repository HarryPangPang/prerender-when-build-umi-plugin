# prerender-umi-plugin

[![NPM version](https://img.shields.io/npm/v/prerender-umi-plugin.svg?style=flat)](https://npmjs.org/package/prerender-umi-plugin) [![NPM downloads](http://img.shields.io/npm/dm/prerender-umi-plugin.svg?style=flat)](https://npmjs.org/package/prerender-umi-plugin)

## Install

```bash
# or yarn
$ npm install prerender-when-build-umi-plugin
```

## Usage

Configure in `.umirc.js`,

```js
export default {
  plugins: [['prerender-umi-plugin']],
};
```

## config

```js
export default defineConfig({
  prerender: {
    outDir: './app/public/dist',
    renderOption: {
      waitForElement: '.some-node',
      devtools: true,
      skipRequest: true,
      headless: false,
      viewport: { width: 1920, height: 1080 },
    },
  },
  ...
}
```

## LICENSE

MIT
