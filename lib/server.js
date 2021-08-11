'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = void 0;

function _express() {
  const data = _interopRequireDefault(require('express'));

  _express = function _express() {
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

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

class Server {
  constructor(Prerenderer) {
    this._prerenderer = void 0;
    this._options = void 0;
    this._expressServer = void 0;
    this._nativeServer = void 0;
    this._prerenderer = Prerenderer;
    this._options = {};
    this._expressServer = (0, _express().default)();
    this._nativeServer = null;
  }

  initialize() {
    const server = this._expressServer;
    this._options = this._prerenderer.getOptions();

    this._prerenderer.modifyServer(this, 'pre-static');

    server.get(
      '*.*',
      _express().default.static(_path().default.resolve(this._options.outDir), {
        dotfiles: 'allow',
      }),
    );

    this._prerenderer.modifyServer(this, 'post-static');

    this._prerenderer.modifyServer(this, 'pre-fallback');

    server.get('*', (req, res) => {
      res.sendFile(
        _path().default.join(
          _path().default.resolve(this._options.outDir),
          this._options.html || 'index.html',
        ),
      );
    });

    this._prerenderer.modifyServer(this, 'post-fallback');

    return new Promise((resolve, reject) => {
      this._nativeServer = server.listen(this._options.port || 1234, () => {
        resolve();
      });
    });
  }

  close() {
    this._nativeServer.close();
  }
}

var _default = Server;
exports.default = _default;
