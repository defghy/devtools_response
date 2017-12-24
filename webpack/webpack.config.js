var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CleanPlugin = require('clean-webpack-plugin');
const ROOT_PATH = process.cwd();
const BUILD_PATH = path.resolve(ROOT_PATH, "network", "chrome", "build");
const SRC_PATH = path.resolve(ROOT_PATH, "network", "src");

module.exports = {
  entry: {
    res: `${SRC_PATH}/index.js`,
    resback: `${SRC_PATH}/background.js`
  },
  output: {
    filename: 'js/[name].js',
    path: BUILD_PATH,
    publicPath: "/"
  },
  resolve: {
    alias: {
        vue:  "vue/dist/vue.js"
    },
    modules: [path.resolve(ROOT_PATH, "src"), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'eslint-loader',
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', query: { importLoaders: 2 } },
          { loader: 'postcss-loader' },
        ],
      },
      {
        test: /\.(scss|sass)$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', query: { importLoaders: 2 } },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.less$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', query: { importLoaders: 2 } },
          { loader: 'postcss-loader',
              options: {
                plugins: (loader) => [
                  require('autoprefixer')()
                ]
              }
          },
          { loader: 'less-loader'},
        ],
      },
      {
        test: new RegExp(`.(${[
            'jpg',
            'jpeg',
            'png',
            'gif',
            'mp3',
            'ttf',
            'woff',
            'woff2',
            'eot',
            'svg',
        ].join('|')})$`, 'i'),
        loader: 'file-loader'
      },
      {
        test: /\.(tpl|string|html)$/,
        use: 'raw-loader'
      }
    ]
  },
  performance: {
    hints: false
  },
  devtool: process.env.NODE_ENV !== 'production'
    ? '#inline-source-map'
    : "eval",
/*  devServer: {
      contentBase: ROOT_PATH,
      compress: true,
      port: 8080,

  }*//*,
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [require("autoprefixer")],
      },
    })
  ]*/

}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    /*,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })*/
    new CleanPlugin(["js", "css"], {
      root: BUILD_PATH
    }),
    // css files from the extract-text-plugin loader
    new ExtractTextPlugin({
      filename: `css/[name]-[chunkhash:8].css`,
      allChunks: true
    })
  ]


  // css打包成一个文件
  module.exports.module.rules[1] = {
    test: /\.css$/i,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', query: { importLoaders: 2, minimize: true } },
        { loader: 'postcss-loader' },
      ],
    }),
  };
  module.exports.module.rules[2] = {
    test: /\.(scss|sass)$/i,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options:  { importLoaders: 2, minimize: true } },
        { loader: 'postcss-loader' },
        { loader: 'sass-loader' }
      ]
    })
  };
  module.exports.module.rules[3] = {
    test: /\.less$/i,
    loader: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        { loader: 'css-loader', options:  { importLoaders: 2, minimize: true } },
        { loader: 'postcss-loader' },
        { loader: 'less-loader' }
      ]
    })
  };
}
