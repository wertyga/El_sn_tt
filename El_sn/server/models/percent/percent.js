import mongoose from 'mongoose';
const log = require('../../common/log')(module);
import { userPercentRemove } from './modelTimer';

import { remindUser } from '../../common/functions/commonFunctions';
import getNeedFields from '../../common/functions/compileNeedFields';

import User from '../user';

const Percent = new mongoose.Schema({
    symbol: {
        type: String
    },
    interval: {
        type: String
    },
    high: Number,
    close: Number,
    low: Number,
    percent: {
        type: Number
    },
    prevUpdate: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true });

Percent.post('save', doc => {
   User.find({ isCool: true }).then(users => {
      Promise.all(users.map(user => {
         const userPercents = user.percents.map(item => item.percentId.toString());
         const userObj = { email: user.email, id: user._id, emailCancelToken: user.emailCancelToken };
         if(userPercents.indexOf(doc._id.toString()) === -1) { // If symbol is NOT present in user's list
            if(doc.percent < 0 && user.isReceiveMail.power) {
               remindUser(userObj, doc, false, false);
            } else if(user.isReceiveMail.power){
               remindUser(userObj, doc, false, true);
            };
            console.log('Percent updated saved!: ', doc._id)
            user.percents.push({ percentId: doc._id});
            return user.save();
         };
      }))
        .then(() => userPercentRemove(doc))
        .catch(e => log.error('Percent.pstSave', e.message));
   });
});



export const percentFields = (instance) => {
    const percentNeedFields = ['symbol', 'interval', 'high', 'close', 'low', 'percent', 'updatedAt', '_id'];
    return getNeedFields(percentNeedFields, instance)
};

export default mongoose.model('percent', Percent);
