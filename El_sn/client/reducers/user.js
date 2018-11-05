import { SET_NEW_USER, CLEAR_USER } from '../actions/constants';

export const initialState = {};

export default function user(state = initialState, action = {}) {
    switch(action.type) {
        case SET_NEW_USER:
            return action.user;

        case CLEAR_USER:
            return initialState;

        default:
            return state;
    };
};