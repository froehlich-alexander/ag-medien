const path = require("path");
const TerserPlugin = require("terser-webpack-plugin")
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const FileManagerWebpackPlugin = require("filemanager-webpack-plugin");

const NODE_MODULES = "node_modules";

const config = {
    mode: "development",
    devtool: "source-map",
    target: "web",
    cache: true,
    parallelism: 40,
    devServer: {
        static: {
            directory: path.resolve("dist"),
            watch: true,
        },
        watchFiles: "dist/**/*",
        liveReload: false,
        hot: false,
        port: 9000,
        client: {
            progress: false,
            overlay: {
                errors: true,
                warnings: false,
            },
            logging: 'warn',
        },
        host: 'localhost',
        allowedHosts: "all"
        ,
    },
    optimization: {
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
        clean: true,
    },
    entry: {
        //tour dev tool
        "tour-dev-tool": {
            import: ["./tour/dev-tool/index.tsx", "./tour/dev-tool/CreateTool.scss"],
            filename: "tour/dev-tool/[name].js",
            // dependOn: ['react', 'react-dom', 'react-bootstrap', 'bootstrap'],
        },
        // "tour-dev-tool-css": {
        //     import: "./tour/dev-tool/CreateTool.scss",
        //     filename: "tour/dev-tool/tour-dev-tool.bundle.css",
        // },

        // normal tour
        tour: {
            import: ["./tour/tour.ts", "./tour/tour.scss"],
            filename: "tour/[name].js",
        },
        // "tour-css": {
        //     import: "./tour/css/tour.scss",
        //     filename: "tour/tour.bundle.css"
        // }
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
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                            sourceMap: true,
                        }
                    },
                    'sass-loader'
                ],
            },
            {
                test: /\.s?[ca]ss$/,
                include: /node_modules/i,
                use: [{
                    loader: path.resolve("webpack-loaders/EmptyCSS.js"),
                }]
            },
            {
                test: /\.(png|jpe?g|gif|svg|webm|webp)$/i,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
            // {
            //     test: /\.(svg|webm|webp|png|jpg)$/,
            //     use: {
            //         loader: path.resolve("webpack-loaders/EmptyCSS.js"),
            //     }
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
                // copy locales
                {
                    from: '**/locales/**/*.json',
                    to: "[path][name][ext]",
                    filter: (filepath) => !/(node_modules)|(dist)/.test(filepath),
                },

                // copy html imgs, etc
                {
                    from: '**/*.(html|svg|webm|webp|jpg|png)',
                    to: '[path][name][ext]',
                    filter: (filepath) => !/(node_modules|dist|test-environement)/.test(filepath)
                },

                // copy pages.json in tour
                {
                    from: "tour/pages.json",
                    to: "tour/[name][ext]",
                },


                // copy libs to dist

                // JS
                // jquery
                {
                    from: NODE_MODULES + '/jquery/dist/jquery.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/jquery/dist/jquery.min.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },

                // bootstrap
                {
                    from: NODE_MODULES + "/bootstrap/dist/js/bootstrap.js",
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/bootstrap/dist/js/bootstrap.bundle.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },

                // react
                {
                    from: NODE_MODULES + '/react/umd/react.development.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/react/umd/react.production.min.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },

                //react-dom
                {
                    from: NODE_MODULES + '/react-dom/umd/react-dom.development.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/react-dom/umd/react-dom.production.min.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },

                // react-bootstrap
                {
                    from: NODE_MODULES + '/react-bootstrap/dist/react-bootstrap.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/react-bootstrap/dist/react-bootstrap.min.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },

                // i18next
                {
                    from: NODE_MODULES + '/i18next/dist/umd/i18next.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/i18next/dist/umd/i18next.min.js',
                    to: 'lib/[name][ext]',
                    info: {minimized: true},
                },

                // CSS
                // bootstrap css
                {
                    from: NODE_MODULES + '/bootstrap/dist/css/bootstrap.css',
                    to: 'lib/css/[name][ext]',
                    info: {minimized: true},
                },
                {
                    from: NODE_MODULES + '/bootstrap/dist/css/bootstrap.min.css',
                    to: 'lib/css/[name][ext]',
                    info: {minimized: true},
                },

                // material icons
                {
                    from: NODE_MODULES + '/material-icons/iconfont',
                    to: 'lib/css/material-icons',
                    toType: "dir",
                    filter: (filepath) => /\.(css)|(woff2?)$/.test(filepath),
                    info: {minimized: true},
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
        new FileManagerWebpackPlugin({
            events: {
                onEnd: {
                    move: [
                        {source: "dist/tour.scss", destination: "dist/tour/tour.scss"},
                        {source: "dist/tour.scss.map", destination: "dist/tour/tour.scss.map"},
                        {source: "dist/tour-dev-tool.css", destination: "dist/tour/dev-tool/tour-dev-tool.css"},
                        {source: "dist/tour-dev-tool.css.map", destination: "dist/tour/dev-tool/tour-dev-tool.css.map"}
                    ]
                }
            }
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
