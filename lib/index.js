'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _prerender = _interopRequireDefault(require('./prerender'));

function _fs() {
  const data = _interopRequireDefault(require('fs'));

  _fs = function _fs() {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require('path'));

  _path = function _path() {
    return data;
  };

  return data;
}

var _puppeteer = _interopRequireDefault(require('./puppeteer'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) {
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key),
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _default(api) {
  api.describe({
    key: 'prerender',
    config: {
      default: {},

      schema(joi) {
        return joi.object();
      },
    },
  });
  api.onBuildComplete(() => {
    let outputPath = api.config.outputPath;
    const prerenderConfig = api.config.prerender || {};

    if (api.config.prerender && api.config.prerender.outDir) {
      outputPath = api.config.prerender.outDir;
    } else {
      prerenderConfig.outDir = outputPath;
    }

    prerenderConfig.server = {};
    prerenderConfig.renderer = new _puppeteer.default(
      prerenderConfig.renderOption
        ? _objectSpread(
            {
              headless: true,
              skipRequest: true,
            },
            prerenderConfig.renderOption,
          )
        : {
            headless: true,
            skipRequest: true,
          },
    );
    const PrerendererInstance = new _prerender.default(prerenderConfig);
    PrerendererInstance.initialize()
      .then(() => {
        return PrerendererInstance.renderRoutes(
          prerenderConfig.routes || ['/'],
        );
      })
      .then(renderedRoutes => {
        renderedRoutes.forEach(renderedRoute => {
          renderedRoute.outputPath = _path().default.join(
            _path().default.resolve(outputPath || 'dist'),
            renderedRoute.route,
          );
        });
        return renderedRoutes;
      })
      .then(renderedRoutes => {
        return Promise.all(
          renderedRoutes.map(
            renderedRoute =>
              new Promise((resolve, reject) => {
                _fs().default.writeFile(
                  renderedRoute.route === '/'
                    ? `${renderedRoute.outputPath}${prerenderConfig.html ||
                        'index.html'}`
                    : `${renderedRoute.outputPath}.html`,
                  renderedRoute.html.trim(),
                  err => {
                    if (err) reject(err);
                    else resolve();
                  },
                );
              }),
          ),
        ).catch(err => {
          const msg = err.message || 'PrerenderSPAPlugin 发生错误';
          PrerendererInstance.destroy();
          throw msg;
        });
      })
      .then(() => {
        PrerendererInstance.destroy();
      })
      .catch(err => {
        console.error(err);
        const msg = err.message || 'PrerenderSPAPlugin 发生错误';
        PrerendererInstance.destroy();
        throw msg;
      });
  });
}
