import { SET_POWER_PERCENT, SET_POWERS_TO_BE_SEEN, DELETE_POWER } from '../actions/constants';

export const initialState = [];

export default function user(state = initialState, action = {}) {
    switch(action.type) {
        case SET_POWER_PERCENT:
            return action.data;

        case DELETE_POWER:
            return state.filter(item => item._id !== action.powerId)

        case SET_POWERS_TO_BE_SEEN:
            return state.map((item) => {
                if(item._id === action.powerId) {
                    return {
                        ...item,
                        isSeen: true
                    };
                } else {
                    return item;
                }
            });

        default:
            return state;
    };
};