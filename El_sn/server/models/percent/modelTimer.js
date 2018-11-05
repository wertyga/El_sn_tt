import User from "../user";
import Percent from "./percent";
const log = require('../../common/log')(module);

const minute = 1000 * 60 * 60;
const hour = minute * 60;
const day = hour * 24;
const month = day * 30;

const timeObj = {
   m: minute,
   h: hour,
   d: day,
};

const interval = timeObj[process.env.INTERVAL.split('')[1]] *  process.env.INTERVAL.split('')[0];

export const userPercentRemove = (percent) => {
   return setTimeout(() => {
      return Promise.all([
         Percent.findByIdAndRemove(percent._id),
         User.update(
           {},
           { $pull: { percents: { percentId: percent._id } } },
           { multi: true })
      ])
        .catch(e => {
           log.error('userPercentRemove', e.message)
        });
   }, interval)
};
