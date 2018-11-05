import axios from 'axios';

import * as consts from './constants';

import { setPairs, setTradePairs } from './api';
import { setPercent } from './socket';

const setUserData = (data = {}, dispatch) => {
   dispatch(setUser(data.user));
   dispatch(setPairs(data.pairs));
   dispatch(setTradePairs(data.tradePairs || []));
   dispatch(setPercent(data.powerPercents));

   localStorage.setItem('token', data.token);

   return data.user._id
};

export const verifyUserCodeWithSignUp = (userID, verifyCode) => dispatch => {
   return axios.post(host(`/auth/verify/${userID}`), { verifyCode })
     .then(res => setUserData(res.data, dispatch))
};

export const remindPass = username => dispatch => {
    return axios.post(host('/auth/remind-pass'), { username })
};
export const changePass = dataObj => dispatch => {
    return axios.post(host('/auth/change-pass'), dataObj)
};

export const userSignUp = data => dispatch => { // Sign up user
   return axios.post(host(data.url), data)
};

export const userAuth = (data) => dispatch => { // User authentication
    return axios.post(host(data.url), data)
      .then(res => setUserData(res.data, dispatch))
};
export function getUserData(id) { // Get user data when reload/enter "/api/user/:id"
    return dispatch => {
        return axios.post(host(`/user/${id}`), { token: getToken() })
            .then(res => {
                dispatch(setUser(res.data.user));
                dispatch(setPairs(res.data.pairs));
                dispatch(setTradePairs(res.data.tradePairs));
                return true;
            })
    };
};
export function setUser(user) { //Set user data to user-reducer
    return {
        type: consts.SET_NEW_USER,
        user
    }
};

export const clearUser = () => dispatch => { // Logout user
    return axios.post(host('/auth/logout'), { token: getToken() })
        .then(() => {
            dispatch(clearUserAction());
            return localStorage.removeItem('token');
        })
};
function clearUserAction() {
    return {
        type: consts.CLEAR_USER
    }
};
