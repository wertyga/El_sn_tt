import path from 'path';

const env = process.env.NODE_ENV;
const dbName = 'crypto_signer';
const PORT = env === 'test' ? 3001 : 3005;

export default {
    host: env === 'development' ? `http://localhost:${PORT}` : `http://46.101.209.10:${PORT}`,
    siteHost: 'https://cryto-signer.tk',
    maxPairs: 5,
    PORT,
    mongoose: {
        uri: `mongodb://localhost:27017/${env === 'test' ? dbName + '-test' : dbName}`,
        options: {
            server: {
                socketOptions: {
                    keepAlive: 1
                }
            }
        }
    },
    fieldToSaveSession: 'authUserId',
    session: {
        secret: "nodeJSForever",
        key: "sid",
        cookie: {
            secure: false,
            sameSite: true,
            httpOnly: true,
            maxAge: 3600000
        }
    },
    hash: {
        secret: 'boooom!',
        salt: 10
    },
    uploads: {
        directory: 'temp',
        destination: path.join(__dirname, '../', 'temp')
    },
    logFile: path.join(process.cwd(), 'node.log'),
   mainCoin: ['BTC', 'ETH']
}
