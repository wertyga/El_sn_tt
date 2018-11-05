import path from 'path';
import { format as formatUrl } from 'url';
import axios from 'axios';

import './electronSockets';

import {app, BrowserWindow, Menu, ipcMain, nativeImage} from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

import { host } from '../client/common/globals';

export let mainWindow;

let userID; // userID that login in app;

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevMode = NODE_ENV === 'development';
const isProd = NODE_ENV === 'production';

export const menuTemplate = [
    {
        label: 'Reload',
        role: 'reload',
        accelerator: 'CommandOrControl+R'
    },
    {
        label: 'Quit',
        role: 'quit',
        accelerator: 'CommandOrControl+Q'
    },
    {
        label: 'Shortcuts',
        submenu: [
            {
                label: 'Reload - CTRL(CMD) + R'
            },
            { type: 'separator'},
            {
                label: 'Quit - CTRL(CMD) + Q'
            }
        ]
    }
];
if(true) {
    menuTemplate.push({
        label: 'DevTools',
        role: 'toggleDevTools',
        accelerator: 'CommandOrControl+Shift+I'
    });
};


export const loginScreen = {
    width: 330,
    height: 600,
    resizable: isDevMode,
    frame: true,
    title: 'Crypto Signer',
    icon: nativeImage.createFromPath(__dirname + '/../icons/crypto_signer_app.png')
};

const createWindow = () => {
    // Create the browser window.
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
    mainWindow = new BrowserWindow(loginScreen);

    // and load the index.html of the app.
    mainWindow.loadURL(formatUrl({
        pathname: path.join(__dirname, '..', 'static', 'index.html'),
        protocol: 'file',
        slashes: true
    }));
    // Open the DevTools.
    if (true) {
        installExtension(REACT_DEVELOPER_TOOLS);
        installExtension(REDUX_DEVTOOLS);
        // mainWindow.webContents.openDevTools();
    };

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.on('quit', () => {
    if(userID) axios.get(host(`/auth/quit-app/${userID}`))
});

// Take user id
ipcMain.on('login_user_id', (e, user_id) => {
    userID = user_id;
});
