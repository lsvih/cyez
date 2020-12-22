const Path = require('path');
const Webpack = require('webpack');
// const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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
        new Webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
        //   new Webpack.DefinePlugin({
        //     'process.env.NODE_ENV': JSON.stringify('production')
        //   }),
        //   new Webpack.optimize.ModuleConcatenationPlugin(),
        //   new MiniCssExtractPlugin({
        //     filename: 'bundle.css'
        //   })
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.s?css$/i,
                use: ['style-loader', 'css-loader?sourceMap=true']
            }
            // {
            //   test: /\.s?css/i,
            //   use : [
            //     MiniCssExtractPlugin.loader,
            //     'css-loader',
            //   ]
            // }
        ]
    },
    resolve: {
        extensions: ['.js']
    },
    node: {
        fs: 'empty'
    }
};
