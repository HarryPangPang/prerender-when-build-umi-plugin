import Server from './server';
class Prerenderer {
  _server: Server;
  _options: { renderer?: any };
  _renderer: any;
  constructor(options: { renderer?: any }) {
    this._server = new Server(this);
    this._options = options || {};
    this._renderer = options.renderer;
  }

  async initialize() {
    await this._server.initialize();
    await this._renderer.initialize();
    return Promise.resolve();
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

  modifyServer(server: any, stage: any) {
    if (this._renderer.modifyServer)
      this._renderer.modifyServer(this, server, stage);
  }

  renderRoutes(routes: any) {
    return this._renderer
      .renderRoutes(routes, this)
      .then((renderedRoutes: any[]) => {
        renderedRoutes.forEach((rendered: { route: string }) => {
          rendered.route = decodeURIComponent(rendered.route);
        });
        return renderedRoutes;
      });
  }
}
export default Prerenderer;
