import { getTradePairs } from '../common/functions/main';

import { userFields } from '../models/user';


import validateCredentials from '../middlewares/session';

import { loginUser } from './auth';

const routes = require('express').Router();

routes.post('/:id', validateCredentials, (req, res) => {
    Promise.all([
        loginUser({ _id: req.params.id}),
        getTradePairs()
    ])
        .then(data => {
            const [user, pairs] = data;
            if(!user) {
                res.status(401).json({ redirect: '/app/login' });
                return;
            }
            const store = {
                user: userFields(user),
                tradePairs: user.tradePairs,
                pairs
            };
            res.json(store)
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))
});

export default routes;