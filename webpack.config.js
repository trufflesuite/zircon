const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')

const outputDir = path.resolve(__dirname, 'dist')
const serverOutputDir = path.resolve(outputDir, 'server')
const webOutputDir = path.resolve(outputDir, 'web')

const envPlugin = (target) => new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.TARGET': JSON.stringify(target)
});

const jsRule = {
  test: /\.js$/,
  rules: [{
    exclude: /node_modules/,
    loader: 'babel-loader'
  }]
}

const cssRule = {
  test: /(\.css|\.scss)$/,
  rules: [
    { loader: 'style-loader'},
    { loader: 'css-loader',
      options: {
        sourceMap: true,
        modules: false
      }
    },
    { loader: 'sass-loader',
      options: {
        sourceMap: true
      }
    }
  ]
}

const fileRule = {
  test: /\.(png|jpg|gif|ttf)$/,
  use: [{
    loader: 'file-loader',
    options: {
      outputPath: 'assets',
      publicPath: '/assets'
    }
  }]
}

// Source: https://jlongster.com/Backend-Apps-with-Webpack--Part-I
var nodeModules = {}
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod
  });

const serverConfig = {
  target: 'node',
  entry: './src/main-browser.js',
  output: {
    path: serverOutputDir,
    filename: 'bundle.js'
  },
  module: {
    rules: [jsRule]
  },
  plugins: [
    envPlugin('node'),
    new CleanWebpackPlugin(serverOutputDir)
  ],
  externals: nodeModules
}

const webConfig = {
  target: 'web',
  entry: './src/index.js',
  output: {
    path: webOutputDir,
    filename: 'bundle.[hash:6].js'
  },
  module: {
    rules: [jsRule, cssRule, fileRule]
  },
  plugins: [
    envPlugin('web'),
    new CleanWebpackPlugin(webOutputDir),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/app.webpack.html')
    })
  ],
  node: {
    fs: 'empty',
  }
}

if (process.env.NODE_ENV === 'production') {
  webConfig.plugins.push(
    new UglifyJsPlugin({
      sourceMap: false
    })
  )
} else {
  webConfig.devtool = 'eval-source-map'
  serverConfig.devtool = 'eval-source-map'
  serverConfig.plugins.push(
    new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
    new WebpackShellPlugin({ onBuildEnd: [`nodemon -w ${serverOutputDir} ${serverOutputDir}/bundle.js ${webOutputDir}`] })
  )
}

module.exports = [webConfig, serverConfig]
