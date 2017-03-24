module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "commonjs": true
  },

  "extends": "eslint:recommended",

  "rules": {
    "no-unused-vars": ["error", { "args": "none" }],
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
};