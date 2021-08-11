// ref:
// - https://umijs.org/plugins/api
import { IApi } from '@umijs/types';
import Prerenderer from './prerender';
import fs from 'fs';
import path from 'path';
import puppeteer from './puppeteer';

export default function(api: IApi) {
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
    let outputPath: any = api.config.outputPath;
    const prerenderConfig = api.config.prerender || {};
    if (api.config.prerender && api.config.prerender.outDir) {
      outputPath = api.config.prerender.outDir;
    } else {
      prerenderConfig.outDir = outputPath;
    }

    prerenderConfig.server = {};
    prerenderConfig.renderer = new puppeteer(
      prerenderConfig.renderOption
        ? { headless: true, skipRequest: true, ...prerenderConfig.renderOption }
        : { headless: true, skipRequest: true },
    );
    const PrerendererInstance = new Prerenderer(prerenderConfig);
    PrerendererInstance.initialize()
      .then(() => {
        return PrerendererInstance.renderRoutes(
          prerenderConfig.routes || ['/'],
        );
      })
      .then(renderedRoutes => {
        renderedRoutes.forEach(
          (renderedRoute: { outputPath: any; route: any }) => {
            renderedRoute.outputPath = path.join(
              path.resolve(outputPath || 'dist'),
              renderedRoute.route,
            );
          },
        );
        return renderedRoutes;
      })
      .then(renderedRoutes => {
        return Promise.all(
          renderedRoutes.map(
            (renderedRoute: { route: string; outputPath: any; html: string }) =>
              new Promise<void>((resolve, reject) => {
                fs.writeFile(
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
