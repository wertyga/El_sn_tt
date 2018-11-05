import { SET_PAIRS, CLEAR_USER } from '../actions/constants';

export const initialState = [];

export default function user(state = initialState, action = {}) {
    switch(action.type) {
        case CLEAR_USER:
            return initialState;

        case SET_PAIRS:
            return action.pairs;

        default:
            return state;
    };
};