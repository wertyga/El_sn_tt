const path = require('path');

const createJSON = require('./createJSON');
const server = require('./babeable_server');
const icons = require('./copyIcons');

const serverPath = path.join(__dirname, '..', 'server');

console.log('[X] Building assets...');
Promise.all([
    createJSON(),
    server(serverPath),
    icons()
]);