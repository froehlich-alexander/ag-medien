const path = require("path");

module.exports = {
    mode: "development",
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    // entry: "C:\\Users\\L254484\\Documents\\Konsti\\programmieren\\ag-medien\\color_picker_bootstrap\\index.js",
    entry: "./color_picker_bootstrap/index.tsx",
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
            }
        ]
    },
    externals: {
        "jquery": "jQuery",
        "react": "React",
        "react-dom": "ReactDOM",
        "bootstrap": "bootstrap",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    cache: true,
}