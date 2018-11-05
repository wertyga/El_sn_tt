import { GET_WHALES_ORDERS } from '../actions/constants';

export const initialState = [];

export default function user(state = initialState, action = {}) {
    switch(action.type) {
        case GET_WHALES_ORDERS:
            return action.orders;

        default:
            return state;
    };
};