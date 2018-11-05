import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

import FlipMove from 'react-flip-move';

import clearSession from '../../common/functions/clearSession';

import { clearUser } from '../../actions/auth';
import { deletePair, getWhaleOrders, deletePercentPair } from '../../actions/api';
import { setPowerPercents } from '../../actions/socket';

import Loading from '../common/Loading/Loading';
import Option from '../common/Option/Option';
import Toggle from '../common/Toggle/Toggle';
import ButterMenu from '../common/ButterMenu/ButterMenu';
import AddingPair from '../AddingPair/AddingPair';
import Pair from '../Pair/Pair';
import Settings from '../Settings/Setting';

import './UserScreen.sass';

class UserScreen extends React.Component {
    constructor(props) {
        super(props);


        this.state = {
            addingPairs: false,
            optionItems: this.props.pairs.length < 1 ? [] :
                this.collectPairs(),
            tradePairs: this.props.tradePairs || [],
            optionValue: '',
            settings: false,
            loading: this.props.loading || false,
            errors: ''
        }
    };

    componentDidUpdate(prevProps) {
        if(this.props.loading !== prevProps.loading) { // Set loading from wrapper socket component
            this.setState({ loading: this.props.loading });
        };
        if(this.props.errors !== prevProps.errors) { // Update errors fom wrapper socket component
            this.setState({ errors: this.props.errors });
        };

        if(this.props.pairs !== prevProps.pairs) { // Update trade pairs
            const optionItems = this.props.pairs.map(item => ({ title: item.symbol, name: `${item.baseAsset}/${item.quoteAsset}` }));
            this.setState({
                optionItems
            });
        };

        if(this.props.tradePairs !== prevProps.tradePairs) {
            this.setState({ tradePairs: this.props.tradePairs });
        };

    };

    changeOptionValue = title => { //Option changing between pairs
        const pair = this.state.optionItems.find(item => item.title === title);

        this.setState({
            optionValue: pair.name
        });
    };

    onChangeOption = e => { // Searching option value
        const value = e.target.value;
        if(e.target.value.match(/\d+/g)) return;

        this.setState({
            optionValue: value,
            optionItems: this.collectPairs(this.props.pairs.filter(item => item.symbol.toUpperCase()
                    .indexOf(value.replace('/', '').toUpperCase()) === 0)),
            errors: ''
        })
    };

    addPair = () => { // Show dialog window to set sign price
        if(this.getPairToAdd()) {
            this.setState({
                addingPair: true,
                errors: ''
            });
        } else {
            this.setState({
                errors: {
                    option: 'Incorrect pair input'
                }
            })
        }
    };

    collectPairs = (pairs = this.props.pairs) => {
        return pairs.map(item => ({ title: item.symbol, name: `${item.baseAsset}/${item.quoteAsset}` }))
    };

    deletePair = id => { // Delete pair
        return this.props.deletePair(id)
            .catch(err => {
                const errors = clearSession(this, err);
                if(errors) this.setState({ errors: errors, loading: false })
            })
    };

    onClose = () => { // Close modal window when setting sign price
        this.setState({
            optionValue: '',
            addingPair: false,
            optionItems: this.collectPairs()
        })
    };

    logout = () => { // Logout user
        setTimeout(() => {
            this.props.clearUser(this.props.user._id);
            this.props.history.push('/');
        }, 350)
    };

    goToWhales = () => { // Fetch whales orders book
        this.setState({ loading: true });
        this.props.getWhaleOrders()
            .then(() => {
                this.props.history.replace(`/user/${this.props.user._id}/whales-orders`);
            })
            .catch(err => {
                const errors = clearSession(this, err);
                if(errors) this.setState({ errors: errors, loading: false })
            })
    };

    getPairToAdd = () => { // Get and check pair for adding sign
        return this.state.optionItems.find(item => item.name === this.state.optionValue)
    };

    render() {
        const flip = {
            enter: {
                from: {
                    transform: 'translateX(50%)',
                    opacity: 0
                },
                to: {
                    transform: 'translateX(0)',
                    opacity: 1
                }
            },
            leave: {
                from: {
                    transform: 'translateX(0)',
                    opacity: 1
                },
                to: {
                    transform: 'translateX(-50%)',
                    opacity: 0
                }
            }
        };

        const main = (
            <div>
                <div className="options">
                    <div className="left-content">
                        <Option
                            value={this.state.optionValue}
                            items={this.state.optionItems}
                            onClick={this.changeOptionValue}
                            emptyValue='--No pairs--'
                            disable={this.state.loading || this.state.optionItems.length < 1}
                            onChange={this.onChangeOption}
                            label="Choose pair:"
                            floatingText='Choose symbol'
                            error={this.state.errors.option}
                            inputRef={node => this.inputRef = node}
                        />
                        <button className="primary" onClick={this.addPair} disabled={!this.state.optionValue}>Add pair</button>
                    </div>

                    {this.state.addingPair &&
                    ReactDOM.createPortal(
                        <AddingPair
                            onClose={this.onClose}
                            pair={this.getPairToAdd()}
                            userId={this.props.user._id}
                        />,
                        document.getElementById('app')
                    )}

                </div>
                <div className="pairsList">
                    <FlipMove enterAnimation={flip.enter} leaveAnimation={flip.leave} style={{ width: '100%'}}>
                        {this.state.tradePairs.map((pair, i) => (
                            <Pair
                                key={pair._id}
                                onClose={this.deletePair}
                                { ...pair }
                            />
                        ))}
                    </FlipMove>
                </div>
            </div>
        );

        const menu = [
            {
                text: 'Get whales orders',
                onClick: () => this.goToWhales(),

            },
            {
                text: 'Get power symbols',
                onClick: () => this.props.history.replace(`/user/${this.props.user._id}/power-orders`),
                className: {
                    sign: this.props.newPowerPercent
                }
            }
        ];

        return (
            <div className="UserScreen">
                <div className="upper_bar">
                    <div className="left">
                        <Toggle
                            open={true}
                            onChange={this.logout}
                            label="Logged"
                        />
                        <div className="user_data">
                            <div className="upper_name">{this.props.user.username}</div>
                            <div className="email">{this.props.user.email}</div>
                        </div>
                    </div>

                    <div className="right">
                        <div className="settings"
                             onMouseDown={e => e.currentTarget.classList.contains('active') ? e.currentTarget.classList.remove('active') : e.currentTarget.classList.add('active')}
                                onClick={() => this.setState({ settings: !this.state.settings })}
                        >
                            <i className="fas fa-cog"></i>
                        </div>
                        <ButterMenu
                            barHeight={3}
                            right
                            className={{ sign: this.props.newPowerPercent }}
                            menu={menu}
                            parentWrapper={this.contentWrapper}
                        />
                    </div>

                </div>

                <div className="content_wrapper" ref={node => this.contentWrapper = node}>
                    {this.state.errors && (typeof this.state.errors !== 'object') && <div className="error">{this.state.errors}</div>}
                    {this.state.loading ? <Loading/> :
                        <FlipMove enterAnimation={flip.enter} leaveAnimation={flip.leave}>
                            {this.state.settings && <Settings history={this.props.history}/>}
                            {!this.state.settings && main}
                        </FlipMove>
                    }
                </div>
            </div>
        );
    }
};

UserScreen.propTypes = {
    updatePairsPrice: PropTypes.func.isRequired, //Update price of all pairs
    deletePair: PropTypes.func.isRequired, //Delete pair by id
    deletePercentPair: PropTypes.func.isRequired, //Delete percent pair by user id
    user: PropTypes.object.isRequired, //User data object
    pairs: PropTypes.array.isRequired, //All available trade pairs
    newPowerPercent: PropTypes.bool.isRequired, // Determinate is new power order is appeared
};

const mapState = state => {
    return {
        user: state.user,
        tradePairs: state.tradePairs,
        pairs: state.pairs,
        newPowerPercent: !!state.powerPercents.find(item => !item.isSeen)
    };
};

export default connect(mapState, {
    deletePair,
    clearUser,
    getWhaleOrders,
    deletePercentPair,
    setPowerPercents
})(UserScreen);