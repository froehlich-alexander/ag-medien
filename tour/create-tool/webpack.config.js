const path = require("path");

module.exports = {
    mode: "development",
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    // entry: "C:\\Users\\L254484\\Documents\\Konsti\\programmieren\\ag-medien\\color_picker_bootstrap\\index.js",
    entry: "./tour/create-tool/index/index.tsx",
    module: {
        rules: [
            // {
            //     test: /\.tsx?$/,
            //     use: "source-map-loader",
            //     enforce: "pre",
            // },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
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
                test: /ColorPicker.scss$/,
                use: ["css-loader","sass-loader"],
            }
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
    // cache: true,
}