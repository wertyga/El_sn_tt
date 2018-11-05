import  { CLEAR_USER } from '../actions/constants';

import { combineReducers } from 'redux';

import user from './user';
import pairs from './pairs';
import tradePairs from './tradePairs';
import whaleOrders from './whaleOrders';
import powerPercents from './powerPercents';

const appReducer =  combineReducers({
    user,
    pairs,
    tradePairs,
    whaleOrders,
    powerPercents
});

export default (state, action) => {
    if(action.type === CLEAR_USER) {
        state = undefined;
    };
    return appReducer(state, action);
};