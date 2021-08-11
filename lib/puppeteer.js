'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

function _puppeteer() {
  const data = _interopRequireDefault(require('puppeteer'));

  _puppeteer = function _puppeteer() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function() {
    var self = this,
      args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}

class PuppeteerRenderer {
  constructor(rendererOptions) {
    this._options = void 0;
    this._puppeteer = void 0;
    this._options = rendererOptions || {};
    this._puppeteer = null;
  } // 初始化浏览器

  initialize() {
    var _this = this;

    return _asyncToGenerator(function*() {
      try {
        // Workaround for Linux SUID Sandbox issues.
        if (process.platform === 'linux') {
          if (!_this._options.args) _this._options.args = [];

          if (_this._options.args.indexOf('--no-sandbox') === -1) {
            _this._options.args.push('--no-sandbox');

            _this._options.args.push('--disable-setuid-sandbox');
          }
        }

        _this._puppeteer = yield _puppeteer().default.launch(_this._options);
      } catch (e) {
        console.error(e);
        console.error('[PuppeteerRenderer] 初始化PuppeteerRenderer失败');
        throw e;
      }

      return _this._puppeteer;
    })();
  } // 处理请求拦截

  handleRequestInterception(page, baseURL) {
    var _this2 = this;

    return _asyncToGenerator(function*() {
      yield page.setRequestInterception(true);
      page.on('request', req => {
        // 跳过所有请求
        if (
          _this2._options.skipRequest &&
          ['fetch', 'xhr', 'websocket'].indexOf(req.resourceType()) > -1
        ) {
          req.abort();
          return;
        } // mock地址

        let apiPath = req._url.split('/');

        apiPath = '/' + apiPath.splice(3).join('/');

        if (
          _this2._options.mock &&
          Object.prototype.toString.call(_this2._options.mock) ===
            '[object Object]' &&
          _this2._options.mock[apiPath]
        ) {
          req.respond({
            content: 'application/json',
            body: JSON.stringify(_this2._options.mock[apiPath]),
          });
          return;
        }

        req.continue();
      });
    })();
  } // 关闭浏览器

  close() {
    this._puppeteer.close();
  } // 渲染指定路径

  renderRoutes(routes, Prerenderer) {
    var _this3 = this;

    return _asyncToGenerator(function*() {
      const options = Prerenderer.getOptions();
      const pagePromises = Promise.all(
        routes.map(
          /*#__PURE__*/ (function() {
            var _ref = _asyncToGenerator(function*(route) {
              const page = yield _this3._puppeteer.newPage();
              const baseURL = `http://localhost:${options.port || 1234}`;
              yield page.setViewport(
                options.renderOption
                  ? options.renderOption.viewport || {
                      width: 1920,
                      height: 1080,
                    }
                  : {
                      width: 1920,
                      height: 1080,
                    },
              );
              yield _this3.handleRequestInterception(page, baseURL);
              yield page.goto(`${baseURL}${route}`, {
                waituntil: 'networkidle2',
                domcontentloaded: true,
                timeout: 60000000,
              }); // 等待某个class

              if (
                options.renderOption &&
                options.renderOption.waitForElement &&
                typeof options.renderOption.waitForElement === 'string'
              ) {
                yield page.waitForSelector(options.renderOption.waitForElement);
              } // sleep 1s

              yield page.waitForTimeout(1000);
              const result = {
                originalRoute: route,
                route: yield page.evaluate('window.location.pathname'),
                html: yield page.content(),
              };
              yield page.close();
              return result;
            });

            return function(_x) {
              return _ref.apply(this, arguments);
            };
          })(),
        ),
      );
      return pagePromises;
    })();
  }
}

var _default = PuppeteerRenderer;
exports.default = _default;
