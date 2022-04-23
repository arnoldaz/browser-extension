import { resolve } from "path";
import { Configuration } from "webpack";
import * as CopyWebpackPlugin from "copy-webpack-plugin";

const config: Configuration = {
    entry: {
        main: "./src/main.tsx",
    },
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ from: "./src/manifest.json" }]
        }),
    ]
};

export default config;