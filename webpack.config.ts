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
        main: "./src/main.tsx",
        popup: "./src/popup/popup-index.tsx",
    },
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    resolve: {
        extensions: [".tsx", ".ts"]
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
            ]
        }),
        new HtmlWebpackPlugin({
            filename: "popup.html",
            template: "./src/popup/popup.html",
        }),
    ],
};

export default config;