const path = require("path");
const TerserPlugin = require("terser-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const config = {
    mode: "production",
    devtool: "source-map",
    target: "web",
    cache: true,
    parallelism: 40,
    devServer: {
        static: {
            directory: path.resolve("dist"),
        },
        watchFiles: "dist/**/*",
        port: 9000,
        client: {
            progress: true,
        },
        host: 'localhost',
        allowedHosts: [
            "localhost",
        ],
    },
    optimization: {
        // minimize: true,
        minimizer: [
            new TerserPlugin({
                test: /\.js$/i,
                exclude: /node_modules/i,
                parallel: true,
            }),
            new CssMinimizerPlugin({
                test: /\.css$/i,
                exclude: /node_modules/i,
                parallel: true,
            }),
        ],
    },
    output: {
        path: path.resolve("dist"),
        // filename: "[path]/[name].bundle.js",
    },
    entry: {
        "tour-dev-tool": {
            import: "./tour/dev-tool/index/index.tsx",
            filename: "tour/dev-tool/[name].bundle.js",
            // dependOn: ['react', 'react-dom', 'react-bootstrap', 'bootstrap'],
        },
        // "jquery": {
        //     import: 'jquery',
        //     filename: "lib/[name].js",
        // },
        // "react": {
        //     import: 'react',
        //     filename: "lib/[name].js",
        // },
        // "react-dom": {
        //     import: "react-dom",
        //     filename: "lib/[name].js",
        //     dependOn: ['react']
        // },
        // bootstrap: {
        //     import: 'bootstrap',
        //     filename: "lib/[name].js",
        // },
        // "react-bootstrap": {
        //     import: 'react-bootstrap',
        //     filename: "lib/[name].js",
        //     dependOn: ['react', 'bootstrap']
        // },
        // i18next: {
        //     import: 'i18next',
        //     filename: "lib/[name].js",
        // },
    },
    module: {
        rules: [
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
            {
                test: /\.s?[ac]ss$/,
                exclude: /node_modules/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", 'sass-loader'],
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
                include: /node_modules/i,
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
    plugins: [
        // new ForkTsCheckerWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new CopyPlugin({
            options: {
                concurrency: 100,
            },
            patterns: [
                // copy html files to dist
                {
                    from: '**/*.html',
                    to: "[path][name][ext]",
                    filter: (filepath) => !/(node_modules)|(dist)/.test(filepath),
                },
                // copy libs to dist

                // JS
                // jquery
                {
                    from: 'node_modules/jquery/dist/jquery.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true},
                },
                {
                    from: 'node_modules/jquery/dist/jquery.min.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                // bootstrap
                {
                    from: "node_modules/bootstrap/dist/js/bootstrap.js",
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                {
                    from: 'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                // react
                {
                    from: 'node_modules/react/umd/react.development.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                {
                    from: 'node_modules/react/umd/react.production.min.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                //react-dom
                {
                    from: 'node_modules/react-dom/umd/react-dom.development.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                {
                    from: 'node_modules/react-dom/umd/react-dom.production.min.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                // react-bootstrap
                {
                    from: 'node_modules/react-bootstrap/dist/react-bootstrap.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                {
                    from: 'node_modules/react-bootstrap/dist/react-bootstrap.min.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                // i18next
                {
                    from: 'node_modules/i18next/dist/umd/i18next.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                {
                    from: 'node_modules/i18next/dist/umd/i18next.min.js',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                // CSS
                // bootstrap css
                {
                    from: 'node_modules/bootstrap/dist/css/bootstrap.css',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                {
                    from: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },

                // material icons
                {
                    from: 'node_modules/material-icons/iconfont/material-icons.css',
                    to: 'lib/[name][ext]',
                    info: { minimized: true },
                },
                // {
                //     from: path.resolve('node_modules/**/*'),
                //     to({context, absoluteFilename}) {
                //
                //     },
                //     filter: (filepath) => {
                //         const moduleName = filepath.split('/')[0];
                //         return Object.keys(config.externals).includes(moduleName);
                //     },
                // }
            ]
        }),
    ],
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


module.exports = config
