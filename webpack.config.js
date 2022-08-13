const path = require("path");
const TerserPlugin = require("terser-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin');
// const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "source-map",
    target: "web",
    cache: true,
    parallelism: 20,
    // devServer: {
    //     static: {
    //         directory: path.resolve("dist"),
    //     },
    //     watchFiles: "dist/**/*",
    //     progress: true,
    // },
    optimization: {
        // minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js$/i,
                exclude: /node_modules/i,
                parallel: true,
            }),
        ],
    },
    output: {
        path: path.resolve("dist"),
        filename: "[name]/[name].bundle.js",
    },
    entry: {
        "tour-dev-tool": "./tour/create-tool/index/index.tsx",
    },
    plugins: [
        // new ForkTsCheckerWebpackPlugin(),
    ],
    module: {
        rules: [
            // {
            //     test: /\.tsx?$/,
            //     use: "source-map-loader",
            //     enforce: "pre",
            // },
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                    },
                },
                exclude: /node_modules/,
            },
            // {
            //     test: /\.css$/,
            //     use: [
            //         "style-loader",
            //         "css-loader",
            //     ],
            // },
            // {
            //     test: /\.s[ac]ss$/,
            //     exclude: /ColorPicker.scss$/,
            //     use: [
            //         "style-loader",
            //         "css-loader",
            //         {
            //             loader: "sass-loader",
            //             options: {
            //                 implementation: require("sass"),
            //                 sassOptions: {
            //                     fiber: require("fiber"),
            //                 }
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.s?[ca]ss$/,
                use: [{
                    loader: path.resolve("webpack-loaders/EmptyCSS.js"),
                }]
            },
            // {
            //     test: /\.scss$/,
            //     use: ["css-loader", "sass-loader"],
            // },
            // {
            //     test: /\.css$/,
            //     use: ["css-loader"],
            // }
        ],
    },
    externals: {
        "jquery": "jQuery",
        "react": "React",
        "react-dom": "ReactDOM",
        "bootstrap": "bootstrap",
        "react-bootstrap": "ReactBootstrap",
        "i18next": "i18next",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    watch: true,
}
