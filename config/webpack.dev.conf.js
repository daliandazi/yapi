const webpack = require('webpack');
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf");

const devWebpackConfig = merge(baseWebpackConfig, {
    mode: "development",
    devtool: "eval",
    output: {
        filename: "[name].bundle.js",
        publicPath: "/",
    },
    devServer: {
        port: "4000",
        proxy: [
            {
                context: ["/api", "/login"],
                // 转发端口自定义
                target: "http://127.0.0.1:3000",
                ws: true,
            },
        ],
        allowedHosts: [".xx.com"],
        clientLogLevel: "trace",
        host: "0.0.0.0",
        hot: true,
        open: false,
        //热更新
        hotOnly: false,//HMR
        historyApiFallback: true,
    },
    plugins: [
        //热更新
        new webpack.HotModuleReplacementPlugin(),//HMR --hot
    ],
});

module.exports = devWebpackConfig;