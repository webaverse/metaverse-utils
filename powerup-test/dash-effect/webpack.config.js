const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    liveReload: true
  },
  module: {
    rules: [
      { test: /\.glsl$/, use: 'webpack-glsl-loader'},
      { test: /\.vert$/, use: 'webpack-glsl-loader'},
      { test: /\.frag$/, use: 'webpack-glsl-loader'}
    ]
  }
};
