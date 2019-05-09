const babel = require('@babel/core');
const Terser = require('terser');
const path = require('path');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');

const scriptPaths = `${path.resolve('./src/assets/scripts/legacy')}/**/*.js`;
const scriptName = process.env.LEGACY_SCRIPT_NAME || 'legacy';
const scriptFilename = `${scriptName}.js.liquid`;

const options = {
  presets: [
    [
      '@babel/env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: {
          browsers: ['last 2 versions'],
        },
      },
    ],
    ['minify', { builtIns: false }],
  ],
};

const minLegacySingleScriptsPlugin = new CopyWebpackPlugin([
  {
    to: '[name].min.[ext]',
    from: { glob: scriptPaths },
    flatten: true,
    transform: (code) => Terser.minify(babel.transform(code, options).code.toString()).code,
  },
]);

const minLegacyMegaScriptPlugin = new MergeIntoSingleFilePlugin({
  files: [
    {
      src: glob.sync(scriptPaths),
      dest: (code) => {
        const data = {};
        data[scriptFilename] = Terser.minify(babel.transform(code, options).code.toString()).code;
        return data;
      },
    },
  ],
});

module.exports = { minLegacySingleScriptsPlugin, minLegacyMegaScriptPlugin };
