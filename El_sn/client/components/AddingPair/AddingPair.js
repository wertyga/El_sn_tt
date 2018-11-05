import { connect } from 'react-redux';

import { setSignPrice, fetchPairPrice } from '../../actions/api';

import Input from '../common/Input/Input';

import './AddingPair.sass';

class AddingPair extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            currentPrice: 0,
            value: '',
            loading: false,
            errors: ''
        };
    };

    componentDidMount() {
        this.setState({ loading: true });
        window.addEventListener('keyup', this.handleKey);
        this.props.fetchPairPrice(this.props.pair.title)
            .then(price => {
                this.setState({ currentPrice: price.toFixed(8), loading: false });
                this.input.focus();
            })
            .catch(err => { this.setState({ errors: err.response ? err.response.data : err.message, loading: false })});
    };

    componentWillUnmount() {
        window.removeEventListener('keyup', this.handleKey)
    };

    handleKey = e => { // Handle keys: Enter and Esc
        if(e.keyCode === 27) {
            this.closeModal();
        } else if(e.keyCode === 13) {
            this.confirmSign();
        }
    };

    closeModal = () => { // Close this modal window
            this.props.onClose();
    };

    onChange = e => { // Change for input
        const value = e.target.value.replace(',', '.');
        if(e.target.value.length > 10) return;
        if(isNaN(value) || value.match(/\.+\.+/g)) return;
        this.setState({
            value
        })
    };

    confirmSign = () => { // Send pair price to server
        if(!this.state.value) return;

        this.setState({ loading: true });
        return this.props.setSignPrice({
            pair: this.props.pair.title,
            price: this.state.value,
            userId: this.props.userId
        })
            .then(() => {
                return this.props.onClose();
            })
            .catch(err => {
                this.setState({
                    errors: err.response ? err.response.data : err.message,
                    loading: false
                })
            });
    };

    render() {
        return (
            <div className="AddingPair">
                <div className="wrapper">
                    {this.state.errors && <div className="error">{this.state.errors}</div>}
                    <div className="content">
                        <h3>{this.props.pair.name}</h3>
                        <div className="current_price"><strong>Current price: </strong>{this.state.currentPrice}</div>
                        <div className="price">
                            <Input
                                placeholder="Set your price..."
                                value={this.state.value}
                                onChange={this.onChange}
                                disabled={this.state.loading || !!this.state.errors}
                                name="signPrice"
                                inputRef={node => this.input = node}
                                floatText="Sign price"
                            />
                        </div>
                    </div>
                    <div className="footer">
                        <button className="primary" disabled={!this.state.value || this.state.loading} onClick={this.confirmSign}>Sign</button>
                        <button className="danger" disabled={this.state.loading} onClick={this.props.onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    };
};

AddingPair.propTypes = {
    pair: PropTypes.shape({
        title: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
    }).isRequired,                           // Pair
    setSignPrice: PropTypes.func.isRequired, // Sending pair data action
    fetchPairPrice: PropTypes.func.isRequired, // Fetch current price of symbol from DB
    userId: PropTypes.string.isRequired, // User id
    onClose: PropTypes.func.isRequired, // Close this modal window
};


export default connect(null, { setSignPrice, fetchPairPrice })(AddingPair);