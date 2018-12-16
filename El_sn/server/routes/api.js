import validateCredentials from '../middlewares/session';
import ValidationCorrectPair from '../middlewares/ValidationCorrectPair';
import { validateEmail } from '../middlewares/inputsValidation';
import { getPowerPercentsFromUser } from '../common/functions/commonFunctions';

import Pair, { pairFields } from '../models/pair';
import ActualPairs  from '../models/tradePairs';
import User, { userFields } from '../models/user';
import Whales from '../models/whale';

import config from '../common/config';

const routes = require('express').Router();

routes.post('/subscribing', validateCredentials, (req, res) => {
    const { userID, data } = req.body;
    if(!userID || typeof userID !== 'string' || userID.length < 1 || !data) {
        res.status(401).json('Access denided');
        return;
    };

    return User.findById(userID)
        .then(user => {
            if(!user) {
                res.status(403).json({ redirect: '/app/login' });
            } else {
                if(!user.isCool && data.power !== user.isReceiveMail.power) {
                    throw new Error('Permission denided')
                } else {
                    user.isReceiveMail = data;
                    return user.save().then(user => res.json({ user: userFields(user) }))
                }
            }
        })
        .catch(err => res.status(400).json({ errors: err.message }))
});

routes.post('/get-whales', validateCredentials, (req, res) => {
    const { amount, type, quoteAsset } = req.body;
    if(!amount || amount < 0 || isNaN(amount)) {
        res.json([]);
        return;
    };
    return Whales.find({ $and: [ { type }, { quoteAsset: quoteAsset.toUpperCase() } ] })
      .where('orders.totalAmount')
      .gt(amount)
        .then(whales => res.json(whales.sort((a, b) => a.amount > b.amount ? -1 : 1)))
        .catch(err => res.status(500).json({ errors: err.message }))
});

routes.post('/delete-percent-pair', validateCredentials, (req, res) => {
    const { userId, percentPairsId } = req.body;

    return User.findById(userId)
        .then(user => {
            user.percents[user.percents.indexOf(percentPairsId)].isDeleted = true;
            return user.save()
        })
        .then(() => res.json(`${percentPairsId} - deleted`))
        .catch(err => res.status(500).json(err.message))
});

routes.post('/set-sign', validateCredentials, ValidationCorrectPair, (req, res) => { // Set sign price
    const { price, pair, userId } = req.body;

    return Promise.all([
       ActualPairs.findOne({ symbol: pair }),
       User.findById(userId)
    ])
      .then(([actualPair, user]) => {
         const { maxPairs } = config;
         if(!actualPair) throw new Error('There is no symbol');
         if(!user.isCool && user.tradePairs.length > maxPairs) {
            throw new Error(`You have not extention acconut to get more than ${maxPairs} pair signs.` +
              `\nTo get an extention account visit ${config.siteHost}/payment`);
         }

         return new Pair({
            title: pair,
            titleId: actualPair._id,
            signPrice: price,
            owner: userId
         }).save()
           .then(pair => {
              return Pair.populateByTitle(pair._id)
           })
           .then(pair => {
              res.json(pair)
           })
      })
      .catch(err => res.status(400).json( err.message ))
});

routes.post('/delete-pair', validateCredentials, (req, res) => { // Delete pair
    const { id } = req.body;
    return Pair.findById(id)
        .then(user => user.remove())
        .then(() => res.json('removed'))
        .catch(err => res.status(500).json(err.message))
});

routes.post('/get-symbol-price/:symbol', (req, res) => { // Get price of symbol for Adding sing price element
    ActualPairs.findOne({ symbol: req.params.symbol })
        .then(pair => {
            if(pair) {
                res.json(pair.price)
            } else {
                res.status(404).json('Symbol not found')
            }
        })
});

routes.post('/edit-user-data', validateCredentials, (req, res) => {
    const { id, sign, text } = req.body;
    if(sign === 'username') {
        return User.findOne({ username: text })
            .then(user => {
                if(user) {
                    res.status(404).json('Username is already exist');
                } else {
                    validateAndEditUser(id, sign, text, res);
                };
            })
    } else if(sign === 'email') {
        return User.findOne({ email: text })
            .then(user => {
                if(user) {
                    res.status(404).json('E-mail is already exist');
                } else if(!validateEmail(text)) {
                    res.status(404).json('E-mail does not valid');
                } else {
                    validateAndEditUser(id, sign, text, res);
                };
            })
    } else {
        validateAndEditUser(id, sign, text, res);
    }
});

routes.post('/set-seen-powers', (req, res) => {
    const { userId, powerId } = req.body;

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.status(401).json({ redirect: '/app/login' });
            } else {
                user.percents.forEach(item => {
                    if(item.percentId.toString() === powerId) item.isSeen = true;
                });
                return user.save()
            };
        })
        .then((user) => res.json(`Success updated: ${powerId}`))
        .catch(err => res.status(500).json(err.message))
});

routes.get('/:userId/get-powers', (req, res) => {
    const { userId } = req.params;

    return getPowerPercentsFromUser(userId)
        .then(user => {
            if(user) {
                res.json(user);
            } else {
                res.status(401).json({ redirect: '/app/login' })
            }
        })
        .catch(err => res.status(500).json(err.message))
});

routes.get('/:userId/delete-power/:powerId', (req, res) => {
    const { userId, powerId } = req.params;

    return User.findById(userId)
        .then(user => {
            if(!user) {
                res.status(401).json({ redirect: '/app/login' });
            } else {
                user.percents = user.percents.filter(item => item.percentId.toString() !== powerId);
                return user.save().then(() => res.json(`Success deleted ${powerId} power symbol`))
            };
        })
        .catch(err => res.status(500).json(err.message))
});

routes.get('/:userID/delete-all-power/', (req, res) => {
   const { userID } = req.params;

   return User.findByIdAndUpdate(userID, { percents: [] })
     .then(() => res.json('deleted all percents'))
     .catch(e => res.status(404).json(e.message))
});

export default routes;


function validateAndEditUser(id, sign, text, res) {
    return User.findById(id)
        .then(user => {
            if(!user) {
                res.status(401).json({ redirect: '/app/login' });
            } else {
                if(sign && !text) {
                    res.status(400).json(`${sign} can not be blank`);
                } else if(!sign) {
                    res.status(400).json('Some input data missed');
                } else {
                    user[sign] = text;
                    return user.save().then(user => res.json({ user: userFields(user) }));
                }
            }
        })
};





