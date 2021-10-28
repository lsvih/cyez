const Path = require('path')
const Webpack = require('webpack')
const {merge} = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-source-map',
    output: {
        chunkFilename: 'js/[name].chunk.js'
    },
    devServer: {
    },
    plugins: [
        new Webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                include: Path.resolve(__dirname, '../src'),
                loader: 'babel-loader'
            },
            {
                test: /\.s?css$/i,
                use: ['style-loader',
                    {
                        loader: 'css-loader',
                        options: {importLoaders: 2, sourceMap: true},
                    },
                ],
            }
        ]
    }
})
