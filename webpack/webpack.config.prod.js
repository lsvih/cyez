const Path = require('path')
const Webpack = require('webpack')
// const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
// const common = require('./webpack.common.js');

module.exports = {
    mode: 'production',
    //devtool: 'source-map',
    //stats: 'errors-only',
    //bail: true,
    entry: './src/cyez/cyez.js',
    output: {
        path: Path.resolve('dist'),
        filename: 'index.js',
        // library: "Cyez", // For <script> import mode
        libraryTarget: 'commonjs2',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new Webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
        //   new Webpack.DefinePlugin({
        //     'process.env.NODE_ENV': JSON.stringify('production')
        //   }),
        //   new Webpack.optimize.ModuleConcatenationPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.s?css$/i,
                use: ['style-loader',
                    {
                        loader: 'css-loader',
                        options: {importLoaders: 2, sourceMap: true},
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
        fallback: {
            fs: false,
        },
    },
}
