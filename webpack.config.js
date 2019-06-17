const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const autoprefixer = require('autoprefixer')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = env => {
  return {
    mode: env.NODE_ENV || 'production',
    entry: {
      app: './js/index.js'
    },
    devtool: env.NODE_ENV === 'development' ? 'eval-source-map' : false,
    devServer: {
      hot: true,
      index: 'index.html',
      before: function () {
        const jsonServer = require('json-server')
        const server = jsonServer.create()
        const router = jsonServer.router('db.json')
        const middlewares = jsonServer.defaults()

        server.use(middlewares)
        server.use(router)
        server.listen(3000, () => {
          console.log('JSON Server is running')
        });
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: { presets: ["es2015"] },
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: "style-loader"
            },
            {
              loader: "css-loader"
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  autoprefixer()
                ],
                sourceMap: true
              }
            },
            {
              loader: "sass-loader"
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './index.ejs',
        filename: 'index.html',
        inject: 'body',
        minify: true,
      }),
    ],
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/'
    }
  }
}
