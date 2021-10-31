module.exports = {
    presets: [
      "@babel/preset-react",
      [
        "@babel/preset-env",
        {
          modules: "commonjs"
        }
      ]
    ],

    plugins: [
      [
        "@babel/plugin-proposal-decorators",
        {
          legacy: true
        }
      ],
      "@babel/transform-runtime",
      [
        "@babel/plugin-proposal-class-properties",{
        "loose" : true
      }
      ],
      [
        "import",
        {
          libraryName: "antd",
          style: true
        }
      ]
    ]
  };