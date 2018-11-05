const fs = require('fs');
const path = require('path');
const babel = require('babel-core');

const babelOptions = {
    presets: ['env', 'react', 'stage-0']
};

module.exports = function babeable(file) { // Babel the server folder and copy it to public
    if(fs.statSync(file).isDirectory()) {
        try {
            fs.statSync(file.replace('server', 'public/server'));
        } catch(e) {
            if(e.code === 'ENOENT') {
                fs.mkdirSync(file.replace('server', 'public/server'));
            } else {
                console.error(e);
                return;
            }
        };

        fs.readdirSync(file)
            .map(item => path.join(file, item))
            .forEach(async item => babeable(item));
    } else if(file.match(/\.js/)){
        babel.transformFile(file, babelOptions, (err, result) => {
            if(err) {
                console.error(err);
                return;
            } else {
                fs.writeFile(file.replace('server', 'public/server'), result.code, err => { if(err) { console.error(err) }})
            };
        });
    };
};

