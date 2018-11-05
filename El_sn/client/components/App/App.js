import { Switch, Route } from 'react-router-dom';

import routes from '../../common/routes';

// import './App.sass';

class App extends React.Component {


    render() {
        return (
            <Switch>
                {routes.map((route, i) => <Route key={i} {...route}/>)}
            </Switch>
        );
    }
}

export default App;

