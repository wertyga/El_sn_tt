import config from '../common/config';

const log = require('../common/log')(module);
const routes = require('express').Router();

import User from '../models/user';

routes.post('/unsubscribing/:userID/:emailToken', (req, res) => {
    const { userID, emailToken } = req.params;

    return User.findById(userID)
        .then(user => {
            if(!user) {
                throw new Error('No such user');
            } else if(emailToken && user.emailCancelToken === emailToken) {
                user.isReceiveMail = { main: false, power: false };
                return user.save();
            } else {
                throw new Error('Wrong security data');
            }
        })
        .then(user => res.json({ user }))
        .catch(err => res.status(400).json({ errors: err.message }))
});

export default routes;