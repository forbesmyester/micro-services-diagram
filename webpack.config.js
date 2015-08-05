var q = {
    plugins: ['require-parts-babel']
};
module.exports = {
    entry: __dirname + "/public/index.jsx",
    module: {
        loaders: [
            {
                test: /\.jsx/,
                loader: "babel-loader",
                query: q
            },
            {
                test: /\.js/,
                loader: "babel-loader",
                query: q
            }
        ]
    },
    lazy: true,
    output: {
        filename: "public/index.js",
        publicPath: "/",
        path: __dirname
    },
    devtool: "inline-source-map"
};



