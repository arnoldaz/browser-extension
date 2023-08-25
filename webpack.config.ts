import { resolve } from "path";
import { Configuration } from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: Configuration = {
    devtool: "source-map",
    stats: {
        all: false,
        errors: true,
        builtAt: true
    },
    entry: {
        main: "./src/main.ts",
        popup: "./src/popup/index.tsx",
        options: "./src/options/index.tsx",
    },
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.svg$/,
                loader: "svg-url-loader"
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "./src/manifest.json" },
                { from: "./src/main.css" },
                { from: "./src/images/favicon.svg" },
            ]
        }),
        new HtmlWebpackPlugin({
            filename: "popup.html",
            template: "./src/popup/popup.html",
            chunks: ["popup"],
        }),
        new HtmlWebpackPlugin({
            filename: "options.html",
            template: "./src/options/options.html",
            chunks: ["options"],
        }),
    ],
};

export default config;