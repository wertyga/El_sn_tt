import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import { Provider } from 'react-redux';
import { BrowserRouter, HashRouter } from 'react-router-dom';

import configureStore from './common/functions/configureStore';

import './common/globals';

import './styles/index.sass';
import './styles/Fonts.sass';
import './styles/fontawesome-all.min.css';

process.env.NODE_ENV === 'production' && window.addEventListener('contextmenu', function(e) { e.preventDefault(); return false });

const store = configureStore();

let app = document.createElement('div');
app.setAttribute('id', 'app');
document.body.prepend(app);

ReactDOM.render (
    <HashRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </HashRouter>,
    document.getElementById('app')
);
