// Create package.json file with dependencies
const fs = require('fs');
const path = require('path');

const nw = false;

const file = path.join(__dirname, '..', 'public', 'package.json');

const JSONContent = `{
    "name": "crypto_signer",
    "version": "1.0.0",
    "description": "",
    "main": ${nw ? '"static/index.html"' : '"./electron/electron.js"'},
    "author": "",
    "license": "ISC",
    "dependencies": {
        "mongoose": "^5.0.17",
        "axios": "^0.17.1",
        "babel-runtime": "^6.26.0",
        "bluebird": "^3.5.1",
        "lodash": "^4.17.10",
        "shortid": "^2.2.8",
        "socket.io-client": "^2.1.1",
        "winston": "^2.3.1",
        "babel-plugin-transform-decorators-legacy": "^1.3.4",
        "babel-plugin-transform-react-constant-elements": "^6.23.0",
        "babel-plugin-transform-react-inline-elements": "^6.22.0",
        "babel-plugin-transform-react-remove-prop-types": "^0.4.10",
        "babel-plugin-transform-runtime": "^6.23.0",
        "babel-preset-env": "^1.6.1",
        "babel-preset-react": "^6.24.1",
        "babel-preset-stage-0": "^6.24.1",
        "babel-register": "^6.26.0",
        "classnames": "^2.2.5",
        "react": "^16.1.1",
        "react-addons-css-transition-group": "^15.6.2",
        "react-dom": "^16.1.1",
        "react-flip-move": "^3.0.2",
        "react-redux": "^5.0.6",
        "react-router-dom": "^4.2.2",
        "redux": "^3.7.2",
        "redux-devtools-extension": "^2.13.2",
        "redux-thunk": "^2.2.0",
        "electron-devtools-installer": "^2.2.4"
        },
    "permissions": ["chrome-extension://*"]
}`;

module.exports = function createJSON() {
    fs.stat(file, (err, stat) => {
        if(err && err.code === 'ENOENT') {
            fs.writeFile(file, JSONContent, (err) => {
                if(err) console.error(`Error in JSON create: ${err}`);
            })
        } else {
            fs.unlink(file, (err, result) => {
                if(err) {
                    console.error(`Error in unlink JSON file: ${err}`);
                } else {
                    fs.writeFile(file, String(JSONContent), (err) => {
                        if(err) console.error(`Error in JSON create: ${err}`);
                    })
                }
            })
        }
    })
};