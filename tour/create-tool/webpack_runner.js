const webpack = require("webpack");
const config = require("./webpack.config");

const loader = webpack(config);

loader.run((error, stats)=>{
    if (error) {
        throw error;
    }
})