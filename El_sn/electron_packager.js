const packager = require('electron-packager');
const debian = require('electron-installer-linux').debian;

const options = {
    dir: './public',
    appVersion: '1.0.0',
    arch: ['x64'],
    executableName: 'Crypto_Signer',
    productName: 'Crypto_signer',
    author: 'We.T',
    icon: './public/icons/crypto_signer.ico',
    out: './BUILD',
    overwrite: true,
    ignore: 'server',
    platform: ['darwin', 'linux', 'win32'],
    appBundleId: 'wc.cryptosigner.com'
};

console.log('[X] Packaging...');

packager(options)
    .then(appPath => {
        console.log('[X] Installers...!');
        console.log(appPath);

        // appPath.forEach(item => {
        //     debian({
        //         src: item, // source location
        //         dest: __dirname + '/BUILD/INSTALLERS', // destination of the installer
        //         arch: 'amd64', // x86_x64 would work both debian and rpm cause controllers are here.
        //         description: 'сrypto '
        //
        //     }).then(success => {
        //         console.log(success)
        //     }).catch(e => {
        //         console.error(e)
        //     })
        // });
    });

module.exports = options;