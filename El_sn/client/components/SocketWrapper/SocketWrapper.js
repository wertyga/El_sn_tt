// Socket wrapper that fetch socket data
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import io from "socket.io-client";
import {ipcRenderer} from "electron";

import { setPowerPercents } from '../../actions/socket';
import { getUserData } from '../../actions/auth';
import { updatePairsPrice, setSeenPower } from '../../actions/api';

import isEmpty from "lodash/isEmpty";
import clearSession from "../../common/functions/clearSession";

import Loading from '../common/Loading/Loading';
import UserScreen from '../UserScreen/UserScreen';
import Whales from '../Whales/Whales';
import PowerPercents from '../PowerPercents/PowerPercents';

// ipcRenderer.send('get_reached_percent', 'User login');
    class SocketWrapper extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                contentOfUpperBar: '',
                loading: false,
                errors: ''
            };
        };

        componentDidMount() {
            // ipcRenderer.send('get_new_powers', [{ symbol: "DFCBTC", percent: -4, high: 0.1233, close: 0.12312}]);
            // ipcRenderer.send('get_new_powers', t);
            // setTimeout(() => {
            //     ipcRenderer.send('get_new_powers', t)
            // }, 1000)
            ipcRenderer.send('login_user', 'User login');

            if (isEmpty(this.props.user)) {
                this.setState({ loading: true });
                this.props.getUserData(this.props.match.params.id)
                    .then(() => {
                        this.setState({ loading: false });
                        this.setupSocket();
                    })
                    .catch(err => {
                        const errors = clearSession(this, err);
                        if(errors) this.setState({ errors: errors, loading: false });
                       Route.replace('/app/login');
                    })
            } else {
                this.setupSocket();
            };
        };

        componentWillUnmount() {
            if(this.socket) this.socket.close();
            // ipcRenderer.send('quit_app', this.props.user._id || localStorage.getItem('token'));
        };

        setupSocket = () => { // Setup socket communicate
            this.socket = io(host(`/`));

            this.socket.emit('room', { id: this.props.user._id});

            this.socket.on('update-price', pairs => {
                if(pairs.pairs.length < 1) return;
                this.props.updatePairsPrice(pairs.pairs)
            });

            this.socket.on('launch_reached_percents', data => {
                const powers = data.data;
                powers.filter(item => !!item);
                if(powers.length < 1) return;
                this.props.setPowerPercents(powers);

                const newPowers = powers.filter(item => !item.isSeen);
                if(newPowers.length > 0) {
                    ipcRenderer.send('get_new_powers', newPowers);
                }
            });

            ipcRenderer.on('set_seen_power', (e, msg) => {
                const powerSymbol = this.props.powerPercents.find(item => item._id === msg);
                if(powerSymbol && !powerSymbol.isSeen) {
                    this.props.setSeenPower(this.props.user._id, msg)
                        .catch(err => {
                            ipcRenderer.send('Error_in_set_seen_power', err.response ? err.response.data : err.message)
                        })
                };
            });
            ipcRenderer.on('go_to_power_page', (e, msg) => {
                this.props.history.replace(`/user/${this.props.user._id}/power-orders`)
            });

            if(this.props.user._id) ipcRenderer.send('login_user_id', this.props.user._id);
        };


        render() {
            return (
                <div className="SocketWrapper">
                    {/*<button className="btn primary" onClick={() => ipcRenderer.send('notify', {})}>Notify</button>*/}
                    {/*<button className="btn primary" onClick={() => ipcRenderer.send('left', {})}>Left</button>*/}
                    {/*<button className="btn primary" onClick={() => ipcRenderer.send('right', {})}>Right</button>*/}
                    {this.state.loading && <Loading />}
                    <Route path="/user/:id" exact render={() => <UserScreen {...this.props} {...this.state}/>}/>
                    <Route path="/user/:id/whales-orders" component={Whales}/>
                    <Route path="/user/:id/power-orders" component={PowerPercents}/>
                </div>
            );
        }
    };

    SocketWrapper.propTypes = {
        setPowerPercents: PropTypes.func.isRequired, // Dispatch power percents
        getUserData: PropTypes.func.isRequired, //Fetch user data when reload/refresh page
        updatePairsPrice: PropTypes.func.isRequired, //Update price of all pairs
        setSeenPower: PropTypes.func.isRequired, // Function for set power one to { isSeen: true }
        powerPercents: PropTypes.array, // Array of power symbols
    };

    const mapState = state => {
        return {
            user: state.user,
            powerPercents: state.powerPercents
        };
    };


export default connect(mapState, { setPowerPercents, getUserData, updatePairsPrice, setSeenPower })(SocketWrapper);
