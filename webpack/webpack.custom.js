const webpack = require('webpack');
const { merge } = require('webpack-merge');
const path = require('path');
const { hashElement } = require('folder-hash');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackNotifierPlugin = require('webpack-notifier');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { container } = require('webpack');
const { ModuleFederationPlugin } = container;

const environment = require('./environment');
const proxyConfig = require('./proxy.conf');

module.exports = async (config, options, targetOptions) => {
  const languagesHash = await hashElement(path.resolve(__dirname, '../src/main/webapp/i18n'), {
    algo: 'md5',
    encoding: 'hex',
    files: { include: ['*.json'] },
  });

  // PLUGINS
  if (config.mode === 'development') {
    config.plugins.push(
      new ESLintPlugin({
        baseConfig: {
          parserOptions: {
            project: ['../tsconfig.app.json'],
          },
        },
      }),
      new WebpackNotifierPlugin({
        title: 'Createyourhumanity',
        contentImage: path.join(__dirname, 'logo-jhipster.png'),
      }),
    );
  }

  // configuring proxy for back end service
  const tls = config.devServer?.server?.type === 'https';
  if (config.devServer) {
    config.devServer.proxy = proxyConfig({ tls });
    config.devServer.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Content-Security-Policy': `
    default-src 'self' http://localhost:4040 http://localhost:8080;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:4040 http://localhost:8080;
    style-src 'self' 'unsafe-inline' http://localhost:4040 http://localhost:8080 http://localhost:9000;
    style-src-elem 'self' 'unsafe-inline' http://localhost:4040 http://localhost:8080;
    connect-src 'self' http://localhost:9000 ws://localhost:* http://localhost:4040 http://localhost:8080 http://localhost:9001 http://localhost:9080;
    font-src 'self' data:;
    img-src 'self' data:;
  `
        .replace(/\s+/g, ' ')
        .trim(),
    };
  }

  if (targetOptions.target === 'serve' || config.watch) {
    config.plugins.push(
      new BrowserSyncPlugin(
        {
          host: 'localhost',
          port: 9000,
          https: tls,
          proxy: {
            target: `http${tls ? 's' : ''}://localhost:${targetOptions.target === 'serve' ? '4200' : '8080'}`,
            ws: true,
            proxyOptions: {
              changeOrigin: false, //pass the Host header to the backend unchanged  https://github.com/Browsersync/browser-sync/issues/430
            },
          },
          socket: {
            clients: {
              heartbeatTimeout: 60000,
            },
          },
          /*
          ghostMode: { // uncomment this part to disable BrowserSync ghostMode; https://github.com/jhipster/generator-jhipster/issues/11116
            clicks: false,
            location: false,
            forms: false,
            scroll: false,
          },
          */
        },
        {
          reload: targetOptions.target === 'build', // enabled for build --watch
        },
      ),
    );
  }

  if (config.mode === 'production') {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        // Webpack statistics in temporary folder
        reportFilename: '../../stats.html',
      }),
    );
  }

  const patterns = [
    {
      // https://github.com/swagger-api/swagger-ui/blob/v4.6.1/swagger-ui-dist-package/README.md
      context: require('swagger-ui-dist').getAbsoluteFSPath(),
      from: '*.{js,css,html,png}',
      to: 'swagger-ui/',
      globOptions: { ignore: ['**/index.html'] },
    },
    {
      from: path.join(path.dirname(require.resolve('axios/package.json')), 'dist/axios.min.js'),
      to: 'swagger-ui/',
    },
    { from: './src/main/webapp/swagger-ui/', to: 'swagger-ui/' },
    // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
  ];

  if (patterns.length > 0) {
    config.plugins.push(new CopyWebpackPlugin({ patterns }));
  }

  config.plugins.push(
    new webpack.DefinePlugin({
      I18N_HASH: JSON.stringify(languagesHash.hash),
      // APP_VERSION is passed as an environment variable from the Gradle / Maven build tasks.
      __VERSION__: JSON.stringify(environment.__VERSION__),
      __DEBUG_INFO_ENABLED__: environment.__DEBUG_INFO_ENABLED__ || config.mode === 'development',
      // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
      // If this URL is left empty (""), then it will be relative to the current context.
      // If you use an API server, in `prod` mode, you will need to enable CORS
      // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
      SERVER_API_URL: JSON.stringify(environment.SERVER_API_URL),
    }),
    new MergeJsonWebpackPlugin({
      output: {
        groupBy: [
          { pattern: './src/main/webapp/i18n/de/*.json', fileName: './i18n/de.json' },
          { pattern: './src/main/webapp/i18n/en/*.json', fileName: './i18n/en.json' },
          // jhipster-needle-i18n-language-webpack - JHipster will add/remove languages in this array
        ],
      },
    }),
  );

  config = merge(
    config,
    {
      experiments: {
        topLevelAwait: true
      },
      // rest of your config...
    },
    targetOptions.configuration === 'instrumenter'
      ? {
          module: {
            rules: [
              {
                test: /\.(js|ts)$/,
                use: [
                  {
                    loader: 'babel-loader',
                    options: {
                      plugins: ['istanbul'],
                    },
                  },
                ],
                enforce: 'post',
                include: path.resolve(__dirname, '../src/main/webapp/'),
                exclude: [/\.(e2e|spec)\.ts$/, /node_modules/, /(ngfactory|ngstyle)\.js/],
              },
            ],
          },
        }
      : {},
    {
      plugins: [
        new ModuleFederationPlugin({
          name: 'createyourhumanity',
          filename: 'remoteEntry.js',
          remotes: {
            heartfullmindgateways: 'heartfullmindgateways@http://localhost:4040/remoteEntry.js',
            friendrequests: 'friendrequests@http://localhost:4040/remoteEntry.js',
            relations: 'relations@http://localhost:4040/remoteEntry.js',
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
            '@angular/core': { singleton: true, eager: true },
            '@angular/common': { singleton: true, eager: true },
            '@angular/router': { singleton: true, eager: true },
            'primeng': { singleton: true, eager: true },
            'primeicons': { singleton: true, eager: true },
            '@patternfly/react-core': { singleton: true, eager: true },
            '@patternfly/react-icons': { singleton: true, eager: true },
          },
        }),
      ],
      output: {
        path: path.resolve(__dirname, '../target/classes/static/'),
        filename: '[name].[contenthash:8].js',
        chunkFilename: '[name].[chunkhash:8].chunk.js',
      },
    },
  );

  return config;
};
