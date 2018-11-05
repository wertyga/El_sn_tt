import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from '../../reducers/rootReducer';

export default (preloadState = {}) => {
    const dev = process.env.NODE_ENV === 'development';
    if(dev) {
        return createStore(rootReducer, preloadState, composeWithDevTools(applyMiddleware(thunk)));
    } else {
        return createStore(rootReducer, preloadState, applyMiddleware(thunk));
    }
};