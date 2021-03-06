const path = require("path");

module.exports = {
  entry: "./src/index.js",
  mode: "production",
  devtool: "inline-source-map",
  devServer: {
    host: "0.0.0.0",
    port: 8080,
    https: true,
    contentBase: "./dist",
  },
  output: {
    filename: "aframe-hologram-shader.js",
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "aframeHologramShader",
      type: "umd",
    },
  },
  externals: {
    aframe: "aframe",
  },
};
