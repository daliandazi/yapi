var fs = require("fs");
const path = require("path");
const os = require('os');
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const devMode = process.env.NODE_ENV !== "production";
const resolve = (dir) => path.resolve(__dirname, "../", dir);

var commonLib = require("../common/plugin.js");
function createScript(plugin, pathAlias) {
    let options = plugin.options ? JSON.stringify(plugin.options) : null;
    if (pathAlias === "node_modules") {
        return `"${plugin.name}" : {module: require('yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
    }
    return `"${plugin.name}" : {module: require('${pathAlias}/yapi-plugin-${plugin.name}/client.js'),options: ${options}}`;
}

function initPlugins(configPlugin) {
    configPlugin = require("../config.json").plugins;
    var systemConfigPlugin = require("../common/config.js").exts;

    var scripts = [];
    if (configPlugin && Array.isArray(configPlugin) && configPlugin.length) {
        configPlugin = commonLib.initPlugins(configPlugin, "plugin");
        configPlugin.forEach((plugin) => {
            if (plugin.client && plugin.enable) {
                scripts.push(createScript(plugin, "node_modules"));
            }
        });
    }

    systemConfigPlugin = commonLib.initPlugins(systemConfigPlugin, "ext");
    systemConfigPlugin.forEach((plugin) => {
        if (plugin.client && plugin.enable) {
            scripts.push(createScript(plugin, "exts"));
        }
    });

    scripts = "module.exports = {" + scripts.join(",") + "}";
    fs.writeFileSync(resolve("./client/plugin-module.js"), scripts);
}

initPlugins();

module.exports = {
    entry: "./client/index.js",
    output: {
        path: resolve("static/prd"),
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules\/(?!(json-schema-editor-visual)\/).*/,
                use: [
                    {
                        loader: "thread-loader",
                        options: {
                            workers: os.cpus().length
                        }
                    },
                    {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    // 待解决问题，使用 MiniCssExtractPlugin 会出现 codemirror 覆盖 toast-ui 样式问题
                    // {
                    //   loader: MiniCssExtractPlugin.loader,
                    //   options: {
                    //     publicPath: './',
                    //     esModule: true,
                    //   },
                    // },
                    "style-loader",
                    "css-loader",
                ],
            },
            {
                test: /\.(sc|sa)ss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "./",
                            hmr: devMode,
                        },
                    },
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.less$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "./",
                            hmr: devMode,
                        },
                    },
                    "css-loader",
                    "less-loader",
                ],
            },
            {
                test: /\.(gif|jpg|jpeg|png|woff|woff2|eot|ttf)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            publicPath: "./static",
                            hmr: devMode,
                        },
                    },
                ],
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                    {
                        loader: '@svgr/webpack',
                        options: {
                            babel: false,
                            icon: true,
                        },
                    },
                ],
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CaseSensitivePathsPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? "css/[name].css" : "css/[name].[contenthash:8].css",
            chunkFilename: devMode ? "css/[id].css" : "css/[id].[contenthash:8].css",
        }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
        new HtmlWebpackPlugin({
            template: resolve("./static/index.html"),
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: "all",
            maxInitialRequests: Infinity,
            minSize: 400000,
            cacheGroups: {
                commons: {
                    chunks: "all",
                    minChunks: 2,
                    name: "commons",
                    maxInitialRequests: 5,
                },
                npmVendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                        )[1];
                        return `npm.${packageName.replace("@", "")}`;
                    },
                },
            },
        },
        runtimeChunk: {
            name: "manifest",
        },
    },
    resolve: {
        modules: ["node_modules"],
        extensions: [".js", ".css", "scss", ".json", ".string", ".tpl"],
        alias: {
            common: resolve("common"),
            "client": resolve("client"),
            "@client": resolve("client"),
            "@server": resolve("server"),
            "@models": resolve("server/models"),
            "exts": resolve("exts"),
            "@reducer": resolve("client/reducer"),
            "@containers": resolve("client/containers"),
            "@components": resolve("client/components"),
            "@svg": resolve("client/assets/icons"),
            "@image": resolve("client/assets/image")
        },
    },
};