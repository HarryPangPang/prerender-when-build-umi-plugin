'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

var _server = _interopRequireDefault(require('./server'));

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

class Prerenderer {
  constructor(options) {
    this._server = void 0;
    this._options = void 0;
    this._renderer = void 0;
    this._server = new _server.default(this);
    this._options = options || {};
    this._renderer = options.renderer;
  }

  initialize() {
    var _this = this;

    return _asyncToGenerator(function*() {
      yield _this._server.initialize();
      yield _this._renderer.initialize();
      return Promise.resolve();
    })();
  }

  destroy() {
    this._renderer.close();

    this._server.close();
  }

  getServer() {
    return this._server;
  }

  getRenderer() {
    return this._renderer;
  }

  getOptions() {
    return this._options;
  }

  modifyServer(server, stage) {
    if (this._renderer.modifyServer)
      this._renderer.modifyServer(this, server, stage);
  }

  renderRoutes(routes) {
    return this._renderer.renderRoutes(routes, this).then(renderedRoutes => {
      renderedRoutes.forEach(rendered => {
        rendered.route = decodeURIComponent(rendered.route);
      });
      return renderedRoutes;
    });
  }
}

var _default = Prerenderer;
exports.default = _default;
