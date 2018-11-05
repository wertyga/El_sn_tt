import shortID from 'shortid';
import validateInputs from '../middlewares/validateRequireFields';

import { getTradePairs } from '../common/functions/main';

import User, { userFields, encryptPassword } from '../models/user';
import Session from '../models/session';

import { sendMailEE } from "../common/functions/commonFunctions";

const route = require('express').Router();

//Verify new User with email-code
route.post('/verify/:userID/', (req, res) => {
   const { userID } = req.params;
   const { verifyCode } = req.body;
   if(!verifyCode) {
      res.status(404).json({ errors: { verifyCode: 'Enter code' } })
      return;
   }

   return Promise.all([
      User.findById(userID),
      getTradePairs(),
   ])
     .then(([user, pairs]) => {
        if(!user) {
           throw { errors: { globalError: 'There is no such user!' } };
        } else {
           if(verifyCode !== user.verifyCode) {
              throw { errors: { verifyCode: 'Code is not correct' } };
           } else {
              user.isVerified = true;
              user.verifyCode = '';
              return Promise.all([
                 user.save(),
                 Session.saveToken(userID),
              ])
                .then(([user, token]) => {
                   res.json({
                      user: userFields(user),
                      token: token,
                      pairs,
                      powerPercents: []
                   })
                })
           }
        };
     })
     .catch(err => {
        res.status(404).json(err);
        console.error(`Error in "signUpNewUser": ${err}`)
     })
});

// Registration new user
route.post('/sign-up', validateInputs, (req, res) => {
   const { username, email } = req.body;
    return User.findOne({ $or: [{ username }, { email }] })
        .then(user => {
            if(user && user.isVerified) {
               const error = new Error('User is already exist');
               error.code = 409;
               throw error;
            };
            return Promise.all([
               user && !user.isVerified && user.remove(),
               setVerifyCodeForSignUp(req.body),
            ])
        })
         .then(([, user]) => {
            const { email, verifyCode, _id } = user;
            const mailOptions = {
               from: '"Crypto_signer" <cryptosignefication@gmail.com>',
               to: email,
               subject: 'Verify code for complite registration from "Crypto_Signer"',
               html: `<p>Verify code:</p><p><strong>${verifyCode}</strong></p>`
            };
            sendMailEE.emit('send_mail', mailOptions);

            res.json({ _id });
            return;
         })
        .catch(err => res.status(err.code || 500).json({ errors: { globalError: err.message }}))
});


//Login user
route.post('/login', validateInputs, (req, res) => {
    return Promise.all([
        User.findOne({ username: req.body.username}, 'hashPassword isVerified'),
        getTradePairs()
    ])
        .then(([user, pairs]) => {
           if(user && !user.isVerified) {
              res.status(404).json({ errors: { username: 'User is not verified'}});
              return;
           }
            if(user && user.hashPassword === encryptPassword(req.body.password)) {
                return User.populateAllFields({ username: req.body.username})
                    .then(user => {
                        return Session.saveToken(user._id.toString())
                            .then(token => {
                                res.json({
                                    user: userFields(user),
                                    tradePairs: user.tradePairs,
                                    pairs,
                                    token: token,
                                    powerPercents: user.percents.map(item => ({
                                        isSeen: item.isSeen,
                                        ...item.percentId._doc
                                    }))
                                })
                            });
                    })
            } else if(!user) {
                res.status(404).json({ errors: { username: 'User is not exist'}});
            } else {
                res.status(404).json({ errors: { password: 'Password is not correct'}});
            }
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))

});

route.post('/logout', (req, res) => { // Logout user
    Session.findByTokenAndRemove(req.body.token)
        .then(() => res.json('logout'))
        .catch(err => console.error(`Error in logout: ${err.message}`))
});

route.get('/quit-app/:userID', (req, res) => {
    return Session.findByUserAndRemove(req.params.userID)
});

route.post('/remind-pass', (req, res) => {
    const { username } = req.body;

    if(!username) {
        return res.status(403).json({ errors: { username: 'Field can not be blank' } });
    } else {
        return User.findOne({ username })
            .then(user => {
                if(!user) {
                    return res.status(404).json({ errors: { username: 'User is not exist' } });
                } else {
                    const verifyCode = shortID.generate();
                    const mailOptions = {
                        from: '"Crypto_signer" <cryptosignefication@gmail.com>',
                        to: user.email,
                        subject: 'Verify code for reestablish password from "Crypto_Signer"',
                        html: `<p>Verify code:</p><p><strong>${verifyCode}</strong></p>`
                    };
                    sendMailEE.emit('send_mail', mailOptions);
                    user.verifyCode = verifyCode;
                    return user.save().then(() => res.json('Code was send!'));
                };
            })
            .catch(err => res.status(err.status || 500).json({ errors: { globalError: err.message } }))
    }
});

route.post('/change-pass', validateInputs, (req, res) => {
    const { password, passwordConfirm } = req.body;
    if(password !== passwordConfirm) {
        return res.status(406).json({ errors: { passwordConfirm: 'Passwords not match' }})
    };

    return User.findOne({ verifyCode: req.body.verifyCode })
        .then(user => {
            if(!user || !user.verifyCode) {
                return res.status(404).json({ errors: { globalError: 'Code expired or user not exist' }})
            } else {
                user.hashPassword = encryptPassword(password);
                user.verifyCode = '';
                return user.save().then(() => {
                    return res.json('Password reset!');
                });
            };
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))
});

export default route;

export function loginUser(searchFieldObj) { // Login user
    return User.populateAllFields(searchFieldObj)
};

function setVerifyCodeForSignUp(body) {
   const verifyCode = shortID.generate();
   return new User({
      username: body.username,
      password: body.password,
      email: body.email,
      verifyCode,
      emailCancelToken: encryptPassword(body.email)
   }).save()
     .catch(err => console.error(`Error in "signUpNewUser": ${err}`));
};
