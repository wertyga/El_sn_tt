const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const dev = process.env.NODE_ENV || 'development';
const isProd = dev === 'production';

const browserConfig = {
    entry: {
        bundle: path.join(__dirname, 'client/index.js')
    },
    externals: [nodeExternals()],
    output: {
        path: path.join(__dirname, 'public', 'static'),
        filename: '[name].js'
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            },

            {
                test: /\.sass$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },

            {
                test: /(.woff2|.woff|.eot|.ttf|.otf|.svg)$/,
                loader: 'url-loader',
                query: {
                    name: `fonts/[name].[ext]`,
                    publicPath: `${__dirname}/public/static`
                }
            },

            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },

            {
                test: /\.(gif|png|jpeg|jpg|svg)$/i,
                loaders: [
                    {
                        loader: 'url-loader',
                    },
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            mozjpeg: {
                                progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 4,
                            },
                            pngquant: {
                                quality: '75-90',
                                speed: 3,
                            },
                        }
                    }
                ]
            }

        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Crypto Signer',
            meta: {
                viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            'React': 'react',
            "PropTypes": "prop-types",
            "Promise": "bluebird",
            "axios":  "axios",
            "classnames": "classnames"
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ]
};


const serverConfig = {
    entry: {
        server: path.join(__dirname, 'server/index.js')
    },
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js',
        libraryTarget: "commonjs2"
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loaders: 'babel-loader'
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.ProvidePlugin({
            'React': 'react',
            "PropTypes":"prop-types",
            "Promise": "bluebird"
        })
    ]
};

const electronConfig = {
    entry: {
        electron: path.join(__dirname, 'electronC/electron.js')
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    externals: [nodeExternals()],
    output: {
        path: path.join(__dirname, 'public', 'electron'),
        filename: '[name].js',
        libraryTarget: "commonjs2",
        publicPath: '/'
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loaders: 'babel-loader'
            },

            {
                test: /\.(png|ico)$/i,
                loader: 'url-loader'
            },

            {
                test: /\.(gif|jpeg|jpg|svg)$/i,
                loaders: [
                    {
                        loader: 'url-loader',
                    },
                    {
                        loader: 'image-webpack-loader',
                        query: {
                            mozjpeg: {
                                progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 4,
                            },
                            pngquant: {
                                quality: '75-90',
                                speed: 3,
                            },
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],

    resolve: {
        extensions: ['.js', '.jsx']
    }
};

let outputConfig = [browserConfig, electronConfig];

if(isProd) {
    browserConfig.plugins.push(new UglifyJsPlugin());
};

module.exports = outputConfig;

// Output folder structure:
// /public
//  /static
//   *bundle.js
//   /media - media files
//   /css - main.css
// *server.js
// *index.js