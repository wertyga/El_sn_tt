import { SET_POWER_PERCENT } from './constants';

export const setPowerPercents = (data) => dispatch => {
    return dispatch(setPercent(data));
};
export const setPercent = data => {
    return {
        type: SET_POWER_PERCENT,
        data
    };
};