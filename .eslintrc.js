module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "plugins": [
        "node",
        "ava"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:node/recommended"

    ],
    "rules": {
        "no-unused-vars": "warn",
        "require-atomic-updates": "warn"
    }
};
