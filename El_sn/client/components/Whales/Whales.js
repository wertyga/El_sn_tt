import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import { getWhaleOrders } from '../../actions/api';
import { getUserData } from '../../actions/auth';

import Loading from '../common/Loading/Loading';

import './Whales.sass';

const optionValues = [3, 5, 6, 8, 10, 20, 50].map(item => String(item));

const WhaleButton = ({ sign, self, className, text, chosen }) => {
    return (
      <button className={classnames({
         [className]: true,
         simple: true,
         active: self.state[chosen] === sign
      })}
              onClick={() => self.setState({ [chosen]: sign })}
      >
         {text}
      </button>

    );
};

class Whales extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            orders: this.props.orders || [],
            loading: true,
            close: [],
            chosen: 'bids',
           quoteAsset: 'btc',
            optionValue: optionValues[4],
            errors: ''
        };
    };

    componentDidMount() {
        this.input.addEventListener('keyup', this.sortOrders)
        return this.getWhaleOrders()
            .then(() => this.setState({ loading: false }))
            .catch(err => {
                this.setState({
                    errors: err.response ? err.response.data.errors : err.message,
                    loading: false
                });
            })
    };

    componentDidUpdate(prevProps, prevState) {
        if(this.props.orders !== prevProps.orders) {
            this.setState({ orders: this.props.orders });
        };

        if((this.state.loading !== prevState.loading) && this.state.loading && this.state.errors) {
            this.setState({ errors: '' });
        };
    };

    getWhaleOrders = () => {
        return this.props.getWhaleOrders(this.state.optionValue, this.state.chosen, this.state.quoteAsset)
    };

    closeClick = id => {
        const existItem = this.state.close.find(item => item === id);
        this.setState({
            close: !existItem ? [...this.state.close, id] : this.state.close.filter(item => item !== id)
        })
    };

    onChangeOption = (e) => {
        if(isNaN(e.target.value)){
            return;
        } else {
            this.setState({
                optionValue: String(e.target.value.replace(/\.|,/, ''))
            });
        };
    };

    sortOrders = (e) => {
        if(!this.state.optionValue && this.state.loading) return;
        if(e && e.keyCode === 13 || !e.keyCode) {
            this.setState({loading: true});
            return this.getWhaleOrders()
                .then(() => {
                    this.setState({loading: false});
                    this.input.blur();
                })
                .catch(err => {
                    this.setState({
                        errors: err.response ? err.response.data.errors : err.message,
                        loading: false
                    });
                    this.input.blur();
                })
        }
    };

    render() {

        const angleDown = <i className="fas fa-angle-down"></i>;
        const angleUp = <i className="fas fa-angle-up"></i>;
        const angleLeft = <i className="fas fa-angle-left"></i>;
        const reload = <i className={this.state.loading ? "fas fa-sync-alt reload loading" : "fas fa-sync-alt reload"} onClick={this.sortOrders}></i>;
        const back = <i className="fas fa-angle-left"></i>;

        return (
            <div className="Whales">
                {this.state.errors && <div className="error">{this.state.errors}</div>}
                {this.state.loading && <Loading />}
                <Link className="upper_black" to={`/user/${this.props.user._id}`}>{back}<p>Whales orders</p></Link>
                <div className="whales_wrapper">
                    <div className="input">
                        <div className="upper">
                            <label htmlFor="InputBtc"><strong>Select BTC value</strong></label>
                            <div className="inner">
                                <input
                                    ref={node => this.input = node}
                                    id="InputBtc"
                                    value={this.state.optionValue}
                                    onChange={this.onChangeOption}
                                    disabled={this.state.loading}
                                /><strong>.BTC</strong>

                                {reload}
                            </div>

                        </div>
                    </div>

                    <div className="orders">
                       <div className="orders_buttons__buy-sell">
                          <WhaleButton
                            className="buyOrders"
                            sign="bids"
                            self={this}
                            text="Buy orders"
                            chosen="chosen"
                          />
                          <WhaleButton
                            className="sellOrders"
                            sign="asks"
                            self={this}
                            text="Sell orders"
                            chosen="chosen"
                          />
                       </div>
                       <div className="orders_buttons__currency">
                          <WhaleButton
                            sign="btc"
                            self={this}
                            text="BTC"
                            chosen="quoteAsset"
                          />
                          <WhaleButton
                            sign="eth"
                            self={this}
                            text="ETH"
                            chosen="quoteAsset"
                          />
                       </div>

                        {this.state.orders.map(item =>
                            <div className="order" key={item._id}>
                                <div className="symbol" onClick={() => this.closeClick(item._id)}>
                                    <span>{item.symbol.replace(item.quoteAsset, `/${item.quoteAsset}`)}</span>
                                    {!this.state.close.find(pair => pair === item._id) ? angleDown : angleUp}
                                </div>
                                <div className={this.state.close.find(pair => pair === item._id) ? 'data close' : 'data'}>
                                    {item.orders.map((order, i) =>
                                        <ul key={i}>
                                            <li>Price: {order.price.toFixed(8)}</li>
                                            <li>Amount: {order.amount}</li>
                                            <li>Total amount: {order.totalAmount} {item.quoteAsset}</li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                        {this.state.orders.length < 1 && !this.state.loading && <div className="empty">This stash is empty now</div>}
                    </div>
                </div>
            </div>
        );
    };
};

Whales.propTypes = {
    getUserData: PropTypes.func.isRequired, // Get User data if that is empty(reload page example)
    getWhaleOrders: PropTypes.func.isRequired, // Fetch whales orders
};

const mapState = state => {
    return {
        orders: state.whaleOrders,
        user: state.user
    };
};

export default connect(mapState, { getWhaleOrders, getUserData })(Whales);
