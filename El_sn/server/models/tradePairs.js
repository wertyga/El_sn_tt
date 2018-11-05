import mongoose from 'mongoose';

import { growPercent } from "../common/functions/main";

import Percent from './percent/percent';

import fetchFields from '../common/functions/compileNeedFields';

const TradePairSchema = new mongoose.Schema({
    symbolData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'symbolData',
        default: null
    },
    symbol: {
        type: String,
        unique: true
    },
    baseAsset: {
        type: String,
        unique: false
    },
    quoteAsset: {
        type: String,
        unique: false,
    },
    price: {
        type: Number,
        default: 0
    },
    prevPrice: {
        type: Number,
        default: 0
    }
});

TradePairSchema.static('findWithSymbolPopulate', function(symbols) {
    let isArray = symbols instanceof Array;
    if(!isArray) symbols = [symbols];

    return Promise.all(symbols.map(item => {
        return this.findOne({ symbol: item })
            .populate('symbolData')
    }))
        .then(datas => {
            if(isArray) {
                return datas;
            } else {
                return datas[0];
            }
        })
});

// TradePairSchema.post('save', function(doc) {
//     const onePercent = doc.prevPrice / 100;
//     const different = Math.round((doc.price - doc.prevPrice) / onePercent);
//     if(different >= growPercent) {
//         return Percent.findOne({ symbol: doc.symbol})
//             .then(percent => {
//                 if(percent && (percent.percent !== different)) {
//                     percent.percent = different;
//                     return percent.save();
//                 } else if(!percent){
//                     return new Percent({
//                         symbol: doc.symbol,
//                         percent: Number(different.toFixed(2)),
//                         close: doc.price
//                     }).save();
//                 } else {
//                     return false;
//                 };
//             })
//     };
// });

export const tradePairFields = (instance) => {
    const tradePairNeedFields = ['price', 'prevPrice', 'symbol', 'baseAsset', 'quoteAsset'];
    return fetchFields(tradePairNeedFields, instance);
};

export default mongoose.model('actualPair', TradePairSchema);
