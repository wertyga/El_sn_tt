import { ipcMain, Notification, nativeImage, app } from 'electron';

import { mainWindow, loginScreen } from './electron';

import compileSymbol from '../server/common/functions/compileSymbols';


import WeNotify from './WeNotification/index';
import icon from '../icons/crypto_signer_app.png';

// Functions
const resizeMainScreen = (win) => {
    win.maximize();
    win.setResizable(true);
    win.setMaximizable(true);
    win.center();
};
const resizeToLoginScreen = (win) => {
    win.setSize(loginScreen.width, loginScreen.height);
    win.setResizable(loginScreen.resizable);
    win.center();
};

// Socket data
ipcMain.on('login_user', (e, msg) => { // Resize main window
    resizeMainScreen(mainWindow);
});
ipcMain.on('logout_user', (e, msg) => { // Resize main window
    resizeToLoginScreen(mainWindow)
});
ipcMain.on('reached_sign_price', (e, msg) => {
    const notification = new WeNotify({
        icon: {
            image: icon,
            title: nativeImage.createFromPath(__dirname + '/../icons/crypto_signer_app.png'),
            width: '10%',
        },
        title: {
            text: compileSymbol(msg.symbol)
        },
        text: {
            text:  `<div>Has been reached sign price - ${msg.signPrice.toFixed(8)}</div> <div>Time: ${msg.time.split('.')[0]}</div>`,
            'margin-left': 10,
            'margin-top': 5
        },
        width: 400,
        height: 100,
        closeTimeout: 1000 * 60 *60
    });
    notification.show();
    notification.on('click', () => notification.close());
});

let symbols = []; // Symbols that are already have been shown
ipcMain.on('get_new_powers', (e, data) => { // Emit if get a percent high Or low
    const title = 'Bounce price';
    data = data.filter(item => symbols.indexOf(item.symbol) === -1);
    let text = data.map(item => {
        symbols.push(item.symbol);

        let text;
        if(item.percent > 0) {
            text = `Just jump up for +${item.percent}%`;
        } else {
            text = `Crush down for ${item.percent}% \n From: ${item.high.toFixed(8)} To: ${item.close.toFixed(8)}`;
        };
        return `<div><strong>${compileSymbol(item.symbol)}</strong></div>` +
               `<div>${text}</div>`;
    });

    text = text.length > 3 ? text.splice(0, 3).join('\n') + 'more...' : text.join('\n');
    const titleHeight = 45;
    const contentHeight = 30;
    const footerHeight = 20;

    const notifyHeight = data.length > 3 ?
        contentHeight * 3 + 10 + titleHeight + footerHeight:
        contentHeight * data.length + titleHeight + footerHeight;

    if(text.length < 1) return;

    const notify = new WeNotify({
        title: {
            text: title
        },
        text: {
            text: text,
            'margin-left': 10
        },
        width: 400,
        height: notifyHeight,
        icon: {
            image: icon,
            title: nativeImage.createFromPath(__dirname + '/../icons/crypto_signer_app.png'),
            width: '10%',
        },
        closeTimeout: 1000 * 60 *60
    });
    notify.show();

    notify.on('close', () => {
        data.forEach(item => {
            setSeenWithCloseNotification(e, item);
            symbols.splice(symbols.indexOf(item.symbol), 1);
        })
        // notification.close();
    });
    notify.on('click', () => {
        mainWindow.focus();
        mainWindow.maximize();
        e.sender.send('go_to_power_page');
        notify.close();
    });
});

ipcMain.on('Error_in_set_seen_power', (e, msg) => {
    const errorNotification = new Notification({
        title: ('Error in power symbol').toUpperCase(),
        body: msg
    });

    errorNotification.show();
});

app.on('ready', () => {});


// ipcMain.on('notify', () => {
//     const notify = new WeNotify({
//         title: {
//             text: 'TITLE'
//         },
//         text: {
//             text: 'asjkhdjash jkdhasjk hdnsah dhsajk hdkjsagh dhasjk hdjsah djhasjk hdsah dhaksj dhsa jkhdhsa djhaskj hdksah kdajsh dk' +
//             'agsd jhajks hdjhsak jhdjsa hjkdhkajsh kdhasjk hdksah kjdhkajsh dkhsakhd kajshd haksjhd kjahskdhaksjhd kjahsjkd hkajshd khasjkd h' +
//             'lajskdjsakj dljas ljdjsa djsa jdjsaj dljasl dlsajl djjsaljd lkajsld lsa d',
//             'margin-left': 10
//         },
//         width: 400,
//         height: 200,
//         icon: {
//             image: icon,
//             title: nativeImage.createFromPath(__dirname + '/../icons/crypto_signer_app.png'),
//             width: '10%',
//
//         },
//         maxWindows: 3,
//     });
//
//     notify.on('close', () => {
//         console.log('close')
//     })
//     notify.on('show', () => {
//         console.log('show')
//     })
//     notify.on('click', () => {
//         console.log('click')
//     })
//
//     notify.show()
// });

function setSeenWithCloseNotification(e, item) {
    e.sender.send('set_seen_power', item._id);
};

