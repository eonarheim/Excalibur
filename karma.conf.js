// Karma configuration
const process = require('process');
const path = require('path');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    singleRun: true,
    frameworks: ['jasmine'],
    files: [  
            'src/spec/_boot.ts', 
            { pattern: 'src/spec/images/**/*.png', included: false, served: true },
            { pattern: 'src/spec/images/**/*.gif', included: false, served: true },
            { pattern: 'src/spec/images/**/*.txt', included: false, served: true }
           ],
    mime: { 'text/x-typescript': ['ts', 'tsx'] },
    preprocessors: {
      'src/spec/_boot.ts': ['webpack']
    },
    webpack: {
      mode: 'none',
      devtool: 'source-map',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
              transpileOnly: true // speeds up tests a TON by only using webpack resolution
            }
          },
          {
            test: /\excalibur.js$/,
            use: {
              loader: 'istanbul-instrumenter-loader',
              options: { esModules: true }
            }
          }
        ]
      }
    },
    webpackMiddleware: {
    // webpack-dev-middleware configuration
    // i. e.
        stats: 'normal'
    },
    reporters: ['progress', 'coverage-istanbul'],

    coverageReporter: {
      reporters: [
          { type: 'html', dir: 'coverage/' }, 
          { type: 'lcovonly', dir: 'coverage/', file: 'lcov.info' }, 
          { type: 'text-summary' }]
    },
    coverageIstanbulReporter: {
      // reports can be any that are listed here: https://github.com/istanbuljs/istanbuljs/tree/aae256fb8b9a3d19414dcf069c592e88712c32c6/packages/istanbul-reports/lib
      reports: ['html', 'lcovonly', 'text-summary'],

      // base output directory. If you include %browser% in the path it will be replaced with the karma browser name
      dir: path.join(__dirname, 'coverage')
    },

    browsers: ['ChromeHeadless'],
    customLaunchers: {
      ChromeHeadless_with_debug: {
        base: 'ChromeHeadless',
        flags: ['--remote-debugging-port=9334', '--no-sandbox', '--disable-web-security']
      },
      Chrome_with_debug: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9334', '--no-sandbox']
      }
    }
  });
};
