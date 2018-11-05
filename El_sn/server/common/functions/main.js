const log = require('../log')(module);

import config from '../config';

import ActualPairs  from '../../models/tradePairs';
import Pair from '../../models/pair';
import Whale  from '../../models/whale';
import SymbolData from '../../models/symbolData';

import Api, { BinanceSocketApi } from '../api/binanceAPI';

export const api = new Api();

export const lowPercent = process.env.LOW_PERCENT;
export const growPercent = process.env.GROW_PERCENT;
export const interval = process.env.INTERVAL;

export function getTradePairs() { //Fetch available trade pairs
    return ActualPairs.find({}, 'symbol baseAsset quoteAsset')
};

export function checkPairsForSignPrice() { // Check all pairs for compare to sign price
    return Pair.find({}).populate('titleId')
        .then(pairs => {
            if(pairs.length < 1) return;
            return Promise.all(pairs.map(pair => {
                if(
                    (!pair.sign) &&
                    ((pair.titleId.price <= pair.signPrice && pair.titleId.prevPrice >= pair.signPrice) ||
                    (pair.titleId.price >= pair.signPrice && pair.titleId.prevPrice <= pair.signPrice))
                ) {
                    pair.sign = true;
                    pair.updatedAt = new Date();
                    return pair.save()
                } else {
                    return false;
                };
            }))
        })
        .catch(err => {
            console.error('Error in "checkPairsForSignPrice" function \n' + err);
            log.error(err, 'checkPairsForSignPrice');
        })
};

const { mainCoin } = config;

const getWhaleData = (data, type) => {
   return data.map(item => {
      return item[type].reduce((initObj, innerArr) => {
         initObj.symbol = innerArr.symbol;
         initObj.orders = initObj.orders ? [...initObj.orders, ...innerArr.data] : [innerArr.data];
         initObj.type = type;

         return initObj;
      }, {});
   })
     .filter(item => {
        return (item.orders || []).length > 0;
     })
     .map(item => {
        const regExp = new RegExp(mainCoin.join('|'), 'i');
        return {
           ...item,
           quoteAsset: ((item.symbol|| '').match(regExp) || [])[0],
           orders: item.orders.filter(order => order.totalAmount > 0)
        }
     })
     .filter(item => item.orders.length > 0);
};
function getWhalesOrders() { // Get whales orders
   const ignore = ['BTCUSDT', 'ETHUSDT'];
    ActualPairs.find({})
        .then(pairs => {
            return Promise.all(pairs.filter(item => ignore.indexOf(item.symbol) === -1).map(pair => {
                return api.getOrdersBook(pair.symbol)
                    .then(data => {
                        return {
                            bids: data.bids.map(item => {
                                return {
                                    symbol: pair.symbol,
                                    data: {
                                        price: item[0],
                                        amount: item[1],
                                        totalAmount: Math.round(Number(item[0]) * Number(item[1]))
                                    }
                                }
                            }),
                            asks: data.asks.map(item => {
                                return {
                                    symbol: pair.symbol,
                                    data: {
                                        price: item[0],
                                        amount: item[1],
                                       totalAmount: Math.round(Number(item[0]) * Number(item[1]))
                                    }
                                }
                            })
                        }
                    })}))
        })
        .then(data => {
                // [ { bids: [{ symbol: 'symbol', data: [Obj] }], asks: [{ symbol: 'symbol', data: [Obj] }] } ]
            let bids = getWhaleData(data, 'bids');
            let asks = getWhaleData(data, 'asks');
            return [...bids, ...asks];
        })
        .then(data => {
            return Whale.deleteMany({}).then(() => data);
        })
        .then(data => {
            return Promise.all(data.map(item => {
                return new Whale(item).save();
            }))
        })
        .catch(err => {
            console.error('Error in "getWhaleOrders" function \n' + err);
            log.error(err, 'getWhaleOrders');
        })
};


// Rest API
function getExchangeInfo() { // Get full exchage info
    return api.exchangeInfo()
        .then(data => {
            const mainSymbols = data.symbols.filter(item => mainCoin.indexOf(item.quoteAsset) !== -1);
            return Promise.all(mainSymbols.map(item => {
                return ActualPairs.findOne({ symbol: item.symbol})
                    .then(pair => {
                        if(!pair) {
                            return new ActualPairs({
                                symbol: item.symbol,
                                baseAsset: item.baseAsset,
                                quoteAsset: item.quoteAsset
                            }).save();
                        } else {
                            return false;
                        };
                    })
            }))
        })
        .then(() => console.log('Exchange info saved! '))
        .catch(err => {
            console.error(`Error in "getExchangeInfo": ${err}`);
            log.error(err)
        })
};

let time = new Date();
// Socket data
function getKlineDataIO(interval) {
    const ws = new BinanceSocketApi();
    return ActualPairs.find({})
        .then(pairs => {
            return Promise.all(pairs.map(item => {
                let symbolWs = ws.getKlineData(item.symbol, interval);
                symbolWs.onmessage = msg => {
                    const data = JSON.parse(msg);
                    const saveDoc = {
                       symbol: data.s,
                       interval: data.k.i,
                       open: Number(data.k.o),
                       close: Number(data.k.c),
                       high: Number(data.k.h),
                       low: Number(data.k.l),
                    };

                    return SymbolData.findOne({ symbol: data.s })
                      .then(doc => {
                         if(doc) {
                            Object.entries(saveDoc).forEach(([key, value]) => doc[key] = value);
                            return doc.save();
                         } else {
                            return new SymbolData(saveDoc).save();
                         }
                      })
                      .catch(e => log.error(e, 'SymbolData.findOne'));
                };
                symbolWs.onerror = err => {
                    console.error(`Error in SocketAPI: ${err}`);
                    log.error(err, 'SocketAPI')
                };
            }))
        })
        .catch(err => console.log(`Error in "getKlineDataIO": ${err}`))
};

function getTime() { // Get server time
    api.getServerTime()
        .then(time => {
            console.log(new Date(time))
        })
        .catch(err => console.log(`Error in "getTime": ${err}`))
};

// Intervals
 setInterval(() => {
     checkPairsForSignPrice();
 }, 10000);
 setInterval(() => {
     return getWhalesOrders();
 }, 60000);
setInterval(() => {
     return getExchangeInfo();
 }, 60000 * 60);

getExchangeInfo().then(() => Promise.all([getKlineDataIO(interval), checkPairsForSignPrice(), getWhalesOrders()]));




