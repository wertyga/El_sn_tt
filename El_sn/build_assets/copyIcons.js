// Copy icons
const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');

module.exports = function copyIcons() {
    const iconFiles = fs.readdir(path.join(__dirname, '..', 'icons'), (err, files) => {
        if(err) {
            console.log(`Error in icons copy: ${err}`)
        } else {
            shelljs.cp('-R', path.join(__dirname, '..', 'icons'), path.join(__dirname, '..', 'public'))
        }
    });
};