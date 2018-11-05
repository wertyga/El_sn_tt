import { ADD_USER_TRADE_PAIR, SET_NEW_USER_TRADE_PAIRS, UPDATE_ALL_USERS_PAIRS_PRICE, DELETE_PAIR, CLEAR_USER } from '../actions/constants';

export const initialState = [];

export default function user(state = initialState, action = {}) {
    switch(action.type) {
        case CLEAR_USER:
            return initialState;

        case SET_NEW_USER_TRADE_PAIRS:
            return action.tradePairs;

        case ADD_USER_TRADE_PAIR:
            return [...state, action.tradePair];

        case UPDATE_ALL_USERS_PAIRS_PRICE:
            return action.pairs;

        case DELETE_PAIR:
            return state.map(pair => {
                if(pair._id === action.id) {
                    return null;
                } else {
                    return pair;
                }
            }).filter(item => !!item);

        default:
            return state;
    };
};